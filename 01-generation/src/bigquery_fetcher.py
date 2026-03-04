from google.cloud import bigquery
import os

def fetch_products(limit=1000):
    """
    Fetches product data from the BigQuery public dataset 'thelook_ecommerce'.
    """
    client = bigquery.Client()
    
    query = f"""
        SELECT 
            id, 
            name, 
            category, 
            brand, 
            retail_price
        FROM 
            `bigquery-public-data.thelook_ecommerce.products`
        LIMIT {limit}
    """
    
    # query_and_wait is available in recent versions of the client library
    # otherwise we use client.query(query).result()
    try:
        query_job = client.query(query)
        rows = query_job.result()
    except Exception as e:
        print(f"Error fetching data from BigQuery: {e}")
        return []
    
    products = []
    for row in rows:
        products.append({
            "id": row.id,
            "name": row.name,
            "category": row.category,
            "brand": row.brand,
            "retail_price": row.retail_price
        })
        
    return products
