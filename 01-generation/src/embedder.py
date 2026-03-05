from vertexai.language_models import TextEmbeddingModel, TextEmbeddingInput


def generate_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Generates embeddings for a list of texts using the text-embedding-005 model.
    """
    if not texts:
        return []

    # The dimensionality of the output embeddings for text-embedding-005.
    dimensionality = 768
    task = "SEMANTIC_SIMILARITY"  # Good default for general purpose

    model = TextEmbeddingModel.from_pretrained("text-embedding-005")

    inputs = [TextEmbeddingInput(text, task) for text in texts]

    kwargs = dict(output_dimensionality=dimensionality)
    embeddings = model.get_embeddings(inputs, **kwargs)

    return [embedding.values for embedding in embeddings]
