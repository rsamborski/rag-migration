import pytest
import os
from unittest.mock import MagicMock, patch
from main import run_worker

def test_run_worker_success():
    # Mock data from DB (products without embedding_v2)
    mock_products = [
        MagicMock(id=1, name="Product 1"),
        MagicMock(id=2, name="Product 2")
    ]
    # Configure mock results to be iterable
    mock_products[0]._mapping = {"id": 1, "name": "Product 1"}
    mock_products[1]._mapping = {"id": 2, "name": "Product 2"}

    mock_embeddings = [[0.1] * 768, [0.2] * 768]

    mock_session = MagicMock()
    # Mock the fetch query
    mock_session.execute.side_effect = [
        MagicMock(all=lambda: mock_products), # Select query
        None, # Update 1
        None  # Update 2
    ]
    
    mock_engine = MagicMock()
    mock_sessionmaker = MagicMock(return_value=mock_session)

    with patch.dict(os.environ, {"CLOUD_RUN_TASK_INDEX": "1", "BATCH_SIZE": "2"}), \
         patch("main.init_db_engine", return_value=mock_engine), \
         patch("main.sessionmaker", return_value=mock_sessionmaker), \
         patch("main.generate_embeddings", return_value=mock_embeddings) as mock_gen_embed:
        
        mock_session.__enter__.return_value = mock_session
        
        success = run_worker()
        assert success is True
        
        # Verify fetch
        assert mock_session.execute.called
        
        # Verify generate_embeddings called with names
        mock_gen_embed.assert_called_once_with(["Product 1", "Product 2"], model="gemini-embedding-001", dimensionality=768)
        
        # Verify commit
        mock_session.commit.assert_called_once()

def test_run_worker_no_products():
    mock_session = MagicMock()
    mock_session.execute.return_value = MagicMock(all=lambda: [])
    mock_sessionmaker = MagicMock(return_value=mock_session)
    
    with patch("main.init_db_engine"), \
         patch("main.sessionmaker", return_value=mock_sessionmaker), \
         patch("main.generate_embeddings") as mock_gen_embed:
        
        mock_session.__enter__.return_value = mock_session
        success = run_worker()
        
        assert success is True
        mock_gen_embed.assert_not_called()
        mock_session.commit.assert_called_once()

def test_init_db_engine_success():
    with patch.dict(os.environ, {"DB_PASSWORD": "test-password", "GOOGLE_CLOUD_PROJECT": "test-project"}), \
         patch("main.Connector"), \
         patch("main.sqlalchemy.create_engine") as mock_create_engine:
        
        from main import init_db_engine
        engine = init_db_engine()
        assert mock_create_engine.called

def test_init_db_engine_no_password():
    with patch.dict(os.environ, {}, clear=True):
        from main import init_db_engine
        with pytest.raises(ValueError, match="DB_PASSWORD environment variable is not set"):
            init_db_engine()
