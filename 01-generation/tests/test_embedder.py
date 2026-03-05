import pytest
import os
from unittest.mock import MagicMock, patch
from src.embedder import generate_embeddings

class MockEmbedding:
    def __init__(self, values):
        self.values = values

class MockResponse:
    def __init__(self, embeddings):
        self.embeddings = embeddings

def test_generate_embeddings_success():
    mock_client = MagicMock()
    mock_response = MockResponse(embeddings=[
        MockEmbedding(values=[0.1, 0.2, 0.3]),
        MockEmbedding(values=[0.4, 0.5, 0.6])
    ])
    
    # Mock nested client.models.embed_content
    mock_client.models.embed_content.return_value = mock_response
    
    with patch("src.embedder.genai.Client", return_value=mock_client):
        texts = ["Product A description", "Product B description"]
        embeddings = generate_embeddings(texts)
        
        assert len(embeddings) == 2
        assert embeddings[0] == [0.1, 0.2, 0.3]
        assert embeddings[1] == [0.4, 0.5, 0.6]
        
        # Ensure the model was called with the right parameters
        mock_client.models.embed_content.assert_called_once()
        
def test_generate_embeddings_empty_input():
    with patch("src.embedder.genai.Client") as mock_client_class:
        embeddings = generate_embeddings([])
        assert len(embeddings) == 0
        mock_client_class.assert_not_called()
