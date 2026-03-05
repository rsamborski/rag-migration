import pytest
import os
from unittest.mock import MagicMock, patch
from main import run_worker

def test_run_worker_success():
    # Set env vars
    env = {
        "CLOUD_RUN_TASK_INDEX": "2",
        "BATCH_SIZE": "50",
        "GOOGLE_CLOUD_PROJECT": "test-project",
        "GOOGLE_CLOUD_REGION": "test-region"
    }
    
    mock_products = [{"id": 101, "name": "P1", "category": "C1", "brand": "B1"}]
    mock_embeddings = [[0.1] * 768]
    expected_text = "Name: P1, Category: C1, Brand: B1"
    
    with patch.dict(os.environ, env), \
         patch("main.fetch_products", return_value=mock_products) as mock_fetch, \
         patch("main.generate_embeddings", return_value=mock_embeddings) as mock_embed, \
         patch("main.write_products_to_alloydb", return_value=True) as mock_write:
         
        success = run_worker()
        
        assert success is True
        # Verify offset calculation: 2 * 50 = 100
        mock_fetch.assert_called_once_with(limit=50, offset=100)
        mock_embed.assert_called_once_with([expected_text])
        mock_write.assert_called_once_with(mock_products, mock_embeddings)

def test_run_worker_no_data():
    with patch.dict(os.environ, {"CLOUD_RUN_TASK_INDEX": "100"}), \
         patch("main.fetch_products", return_value=[]) as mock_fetch:
        success = run_worker()
        assert success is True
        mock_fetch.assert_called_once()
