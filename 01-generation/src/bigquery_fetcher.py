from google.cloud import bigquery
import os


def get_total_products() -> int:
    """
    Returns the total number of products in the dataset.
    """
    client = bigquery.Client()
    query = "SELECT COUNT(*) as total_count FROM `bigquery-public-data.thelook_ecommerce.products`"
    try:
        query_job = client.query(query)
        results = list(query_job.result())
        if results:
            return results[0].total_count
        return 0
    except Exception as e:
        print(f"Error fetching total count from BigQuery: {e}")
        return 0


def fetch_products(limit=100, offset=0):
    """
    Fetches product data from the BigQuery public dataset 'thelook_ecommerce' using limit and offset.
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
        ORDER BY 
            id
        LIMIT {limit} OFFSET {offset}
    """

    try:
        query_job = client.query(query)
        rows = query_job.result()
    except Exception as e:
        print(f"Error fetching data from BigQuery: {e}")
        return []

    products = []
    for row in rows:
        products.append(
            {
                "id": row.id,
                "name": row.name,
                "category": row.category,
                "brand": row.brand,
                "retail_price": row.retail_price,
            }
        )

    return products
