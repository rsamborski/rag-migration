import os
import sqlalchemy
from google.cloud.alloydb.connector import Connector, IPTypes
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

def init_db_engine() -> sqlalchemy.engine.Engine:
    """Initializes and returns a SQLAlchemy engine connected to AlloyDB."""
    
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT", "rsamborski-rag")
    region = "europe-central2"
    cluster = "rag-migration-cluster"
    instance = "rag-migration-instance"
    
    inst_uri = f"projects/{project_id}/locations/{region}/clusters/{cluster}/instances/{instance}"
    user = "postgres"
    password = "change-me-immediately"
    db_name = "rag_migration"
    
    connector = Connector()

    def getconn():
        conn = connector.connect(
            inst_uri,
            "pg8000",
            user=user,
            password=password,
            db=db_name,
            ip_type=IPTypes.PUBLIC
        )
        return conn

    engine = sqlalchemy.create_engine(
        "postgresql+pg8000://",
        creator=getconn,
    )
    return engine

def write_products_to_alloydb(products: list[dict], embeddings: list[list[float]]) -> bool:
    """
    Writes product data and their corresponding embeddings to the AlloyDB database.
    """
    if len(products) != len(embeddings):
        raise ValueError("The number of products must match the number of embeddings.")
    
    if not products:
        return True
        
    engine = init_db_engine()
    Session = sessionmaker(bind=engine)
    
    try:
        with Session() as session:
            # We use raw SQL with SQLAlchemy text for simplicity and pgvector compatibility
            insert_stmt = text("""
                INSERT INTO products (bigquery_id, name, category, brand, retail_price, embedding)
                VALUES (:bigquery_id, :name, :category, :brand, :retail_price, :embedding)
            """)
            
            for i, product in enumerate(products):
                # pgvector expects a string representation of the array like '[0.1, 0.2, ...]'
                embedding_str = "[" + ",".join(str(x) for x in embeddings[i]) + "]"
                
                session.execute(insert_stmt, {
                    "bigquery_id": product.get("id"),
                    "name": product.get("name"),
                    "category": product.get("category"),
                    "brand": product.get("brand"),
                    "retail_price": product.get("retail_price"),
                    "embedding": embedding_str
                })
            
            session.commit()
        return True
    except Exception as e:
        print(f"Failed to write to AlloyDB: {e}")
        return False
