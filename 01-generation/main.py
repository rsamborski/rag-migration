import os
from src.bigquery_fetcher import fetch_products
from src.embedder import generate_embeddings
from src.db_writer import write_products_to_alloydb

def run_worker():
    """
    Worker logic for a single Cloud Run Job task.
    Determines its batch based on the task index.
    """
    # Cloud Run Job environment variables
    task_index = int(os.environ.get("CLOUD_RUN_TASK_INDEX", 0))
    batch_size = int(os.environ.get("BATCH_SIZE", 100))
    
    # Calculate offset
    offset = task_index * batch_size
    
    print(f"Task {task_index}: Fetching batch of {batch_size} products starting at offset {offset}...")
    products = fetch_products(limit=batch_size, offset=offset)
    
    if not products:
        print(f"Task {task_index}: No products found in this batch. Task complete.")
        return True
        
    print(f"Task {task_index}: Generating embeddings for {len(products)} products...")
    # Prepare text for embedding: "Name: [name], Category: [category], Brand: [brand]"
    texts_to_embed = [
        f"Name: {p.get('name')}, Category: {p.get('category')}, Brand: {p.get('brand')}"
        for p in products
    ]
    
    embeddings = generate_embeddings(texts_to_embed)
    
    print(f"Task {task_index}: Writing {len(embeddings)} records to AlloyDB...")
    success = write_products_to_alloydb(products, embeddings)
    
    if success:
        print(f"Task {task_index}: Batch completed successfully.")
    else:
        print(f"Task {task_index}: Batch failed during database write.")
        
    return success

if __name__ == "__main__":
    success = run_worker()
    if not success:
        exit(1)
