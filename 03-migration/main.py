import os
import sys
import sqlalchemy
from google.cloud.alloydb.connector import Connector, IPTypes
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from src.embedder import generate_embeddings

def init_db_engine() -> sqlalchemy.engine.Engine:
    """Initializes and returns a SQLAlchemy engine connected to AlloyDB."""

    project_id = os.environ.get("ALLOYDB_PROJECT", os.environ.get("GOOGLE_CLOUD_PROJECT", "rsamborski-rag"))
    region = os.environ.get("ALLOYDB_REGION", "europe-central2")
    cluster = os.environ.get("ALLOYDB_CLUSTER", "rag-migration-cluster")
    instance = os.environ.get("ALLOYDB_INSTANCE", "rag-migration-instance")

    inst_uri = f"projects/{project_id}/locations/{region}/clusters/{cluster}/instances/{instance}"
    user = os.environ.get("ALLOYDB_USER", "postgres")
    password = os.environ.get("DB_PASSWORD")
    if not password:
        raise ValueError("DB_PASSWORD environment variable is not set.")
        
    db_name = os.environ.get("ALLOYDB_DATABASE", "rag_migration")

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

def run_worker():
    """
    Worker logic for a single Cloud Run Job task.
    Fetches a batch of products missing embedding_v2 using task_index and BATCH_SIZE,
    generates embeddings, and updates the database.
    """
    task_index = int(os.environ.get("CLOUD_RUN_TASK_INDEX", 0))
    batch_size = int(os.environ.get("BATCH_SIZE", 100))
    offset = task_index * batch_size

    engine = init_db_engine()
    Session = sessionmaker(bind=engine)

    # Environment variables for model and dimension
    model_name = os.environ.get("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001")
    dimension = int(os.environ.get("GEMINI_EMBEDDING_DIMENSION", "768"))

    with Session() as session:
        # Fetch products where embedding_v2 is null, respecting offset
        print(f"Task {task_index}: Fetching batch of {batch_size} products starting at offset {offset}...")
        fetch_stmt = text("""
            SELECT id, name FROM products 
            WHERE embedding_v2 IS NULL
            ORDER BY id
            LIMIT :batch_size OFFSET :offset
        """)
        
        products = session.execute(fetch_stmt, {"batch_size": batch_size, "offset": offset}).all()
        
        if not products:
            print(f"Task {task_index}: No products found needing migration in this batch.")
            session.commit()
            return True

        print(f"Task {task_index}: Found {len(products)} products to re-embed.")
        
        product_names = [p._mapping["name"] for p in products]
        product_ids = [p._mapping["id"] for p in products]
        
        # Generate embeddings using the new model
        print(f"Task {task_index}: Generating embeddings using {model_name}...")
        new_embeddings = generate_embeddings(
            product_names, 
            model=model_name, 
            dimensionality=dimension
        )
        
        # Update the database
        update_stmt = text("""
            UPDATE products 
            SET embedding_v2 = :embedding 
            WHERE id = :id
        """)
        
        print(f"Task {task_index}: Writing {len(new_embeddings)} records to AlloyDB...")
        for i, product_id in enumerate(product_ids):
            embedding_str = "[" + ",".join(str(x) for x in new_embeddings[i]) + "]"
            session.execute(update_stmt, {"embedding": embedding_str, "id": product_id})
            
        session.commit()
        print(f"Task {task_index}: Successfully migrated {len(products)} products.")
        return True

if __name__ == "__main__":
    success = run_worker()
    if not success:
        exit(1)
