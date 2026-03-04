import pytest
from unittest.mock import MagicMock, patch
from src.bigquery_fetcher import fetch_products

class MockRow:
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

def test_fetch_products_success():
    # Mock BigQuery Client and Query Job
    mock_client = MagicMock()
    mock_query_job = MagicMock()
    
    # Mock row data with object access
    mock_rows = [
        MockRow(id=1, name="Product A", category="Cat A", brand="Brand A", retail_price=10.0),
        MockRow(id=2, name="Product B", category="Cat B", brand="Brand B", retail_price=20.0),
    ]
    
    mock_query_job.result.return_value = mock_rows
    mock_client.query.return_value = mock_query_job
    
    with patch("google.cloud.bigquery.Client", return_value=mock_client):
        products = fetch_products(limit=2)
        
        assert len(products) == 2
        assert products[0]["name"] == "Product A"
        assert products[1]["id"] == 2
        mock_client.query.assert_called_once()

def test_fetch_products_empty():
    mock_client = MagicMock()
    mock_query_job = MagicMock()
    mock_query_job.result.return_value = []
    mock_client.query.return_value = mock_query_job
    
    with patch("google.cloud.bigquery.Client", return_value=mock_client):
        products = fetch_products(limit=10)
        assert len(products) == 0
