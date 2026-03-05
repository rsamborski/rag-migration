import os
from google import genai
from google.genai.types import EmbedContentConfig

def generate_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Generates embeddings for a list of texts using the text-embedding-005 model.
    Uses the new google-genai SDK to avoid deprecation warnings.
    """
    if not texts:
        return []
        
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT", "rsamborski-rag")
    location = os.environ.get("GOOGLE_CLOUD_REGION", "europe-central2")
    
    # Initialize the Gen AI client for Vertex AI
    client = genai.Client(vertexai=True, project=project_id, location=location)
    
    # The dimensionality of the output embeddings for text-embedding-005.
    dimensionality = 768 
    task = "RETRIEVAL_DOCUMENT" # standard task for documents in RAG
    
    response = client.models.embed_content(
        model="text-embedding-005",
        contents=texts,
        config=EmbedContentConfig(
            task_type=task,
            output_dimensionality=dimensionality
        )
    )
    
    return [embedding.values for embedding in response.embeddings]
