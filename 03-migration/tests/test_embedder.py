import pytest
from unittest.mock import MagicMock, patch
from src.embedder import generate_embeddings

class MockEmbedding:
    def __init__(self, values):
        self.values = values

class MockResponse:
    def __init__(self, embeddings):
        self.embeddings = embeddings

def test_generate_embeddings_success_default():
    mock_client = MagicMock()
    mock_response = MockResponse(embeddings=[
        MockEmbedding(values=[0.1] * 768)
    ])
    mock_client.models.embed_content.return_value = mock_response
    
    with patch("src.embedder.genai.Client", return_value=mock_client):
        texts = ["Some text"]
        embeddings = generate_embeddings(texts)
        
        assert len(embeddings) == 1
        kwargs = mock_client.models.embed_content.call_args.kwargs
        assert kwargs["model"] == "text-embedding-005"
        assert kwargs["config"].output_dimensionality == 768

def test_generate_embeddings_custom_model_and_dim():
    mock_client = MagicMock()
    mock_response = MockResponse(embeddings=[
        MockEmbedding(values=[0.1] * 768)
    ])
    mock_client.models.embed_content.return_value = mock_response
    
    with patch("src.embedder.genai.Client", return_value=mock_client):
        texts = ["Test text"]
        embeddings = generate_embeddings(texts, model="gemini-embedding-001", dimensionality=768)
        
        assert len(embeddings) == 1
        kwargs = mock_client.models.embed_content.call_args.kwargs
        assert kwargs["model"] == "gemini-embedding-001"
        assert kwargs["config"].output_dimensionality == 768
