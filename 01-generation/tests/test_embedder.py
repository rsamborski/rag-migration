import pytest
from unittest.mock import MagicMock, patch
from src.embedder import generate_embeddings

class MockEmbedding:
    def __init__(self, values):
        self.values = values

def test_generate_embeddings_success():
    mock_model = MagicMock()
    # Mocking the response of get_embeddings
    mock_model.get_embeddings.return_value = [
        MockEmbedding(values=[0.1, 0.2, 0.3]),
        MockEmbedding(values=[0.4, 0.5, 0.6])
    ]
    
    with patch("src.embedder.TextEmbeddingModel.from_pretrained", return_value=mock_model):
        texts = ["Product A description", "Product B description"]
        embeddings = generate_embeddings(texts)
        
        assert len(embeddings) == 2
        assert embeddings[0] == [0.1, 0.2, 0.3]
        assert embeddings[1] == [0.4, 0.5, 0.6]
        
        # Ensure the model was called with the right parameters
        mock_model.get_embeddings.assert_called_once()
        
def test_generate_embeddings_empty_input():
    with patch("src.embedder.TextEmbeddingModel.from_pretrained") as mock_from_pretrained:
        embeddings = generate_embeddings([])
        assert len(embeddings) == 0
        mock_from_pretrained.assert_not_called()
