import os
import sqlalchemy
from google.cloud.alloydb.connector import Connector, IPTypes
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from src.embedder import generate_embeddings

def init_db_engine() -> sqlalchemy.engine.Engine:
    """Initializes and returns a SQLAlchemy engine connected to AlloyDB."""

    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT", "rsamborski-rag")
    region = "europe-central2"
    cluster = "rag-migration-cluster"
    instance = "rag-migration-instance"

    inst_uri = f"projects/{project_id}/locations/{region}/clusters/{cluster}/instances/{instance}"
    user = "postgres"
    password = os.environ.get("DB_PASSWORD")
    if not password:
        raise ValueError("DB_PASSWORD environment variable is not set.")
        
    db_name = "rag_migration"

    connector = Connector()

    def getconn():
        conn = connector.connect(
            inst_uri,
            "pg8000",
            user=user,
            password=password,
            db=db_name,
            ip_type=IPTypes.PUBLIC,
        )
        return conn

    engine = sqlalchemy.create_engine(
        "postgresql+pg8000://",
        creator=getconn,
    )
    return engine

def run_migration(batch_size: int = 100):
    """
    Fetches products that are missing gemini-embedding-001 (embedding_v2),
    generates them in batches, and updates the database.
    """
    engine = init_db_engine()
    Session = sessionmaker(bind=engine)

    # Environment variables for model and dimension
    model_name = os.environ.get("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001")
    dimension = int(os.environ.get("GEMINI_EMBEDDING_DIMENSION", "768"))

    with Session() as session:
        # 1. Fetch products where embedding_v2 is null
        fetch_stmt = text("""
            SELECT id, name FROM products 
            WHERE embedding_v2 IS NULL
            LIMIT :batch_size
        """)
        
        products = session.execute(fetch_stmt, {"batch_size": batch_size}).all()
        
        if not products:
            print("No products found needing migration.")
            session.commit()
            return

        print(f"Found {len(products)} products to re-embed.")
        
        product_names = [p._mapping["name"] for p in products]
        product_ids = [p._mapping["id"] for p in products]
        
        # 2. Generate embeddings using the new model
        new_embeddings = generate_embeddings(
            product_names, 
            model=model_name, 
            dimensionality=dimension
        )
        
        # 3. Update the database
        update_stmt = text("""
            UPDATE products 
            SET embedding_v2 = :embedding 
            WHERE id = :id
        """)
        
        for i, product_id in enumerate(product_ids):
            embedding_str = "[" + ",".join(str(x) for x in new_embeddings[i]) + "]"
            session.execute(update_stmt, {"embedding": embedding_str, "id": product_id})
            
        session.commit()
        print(f"Successfully migrated {len(products)} products.")

if __name__ == "__main__":
    run_migration()
