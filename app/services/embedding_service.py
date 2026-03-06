from openai import AzureOpenAI
from app.core.config import (
    AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_ENDPOINT,
    AZURE_EMBEDDING_API_VERSION,
    AZURE_EMBEDDING_DEPLOYMENT,
)

_aoai = AzureOpenAI(
    api_key=AZURE_OPENAI_API_KEY,
    api_version=AZURE_EMBEDDING_API_VERSION,
    azure_endpoint=AZURE_OPENAI_ENDPOINT,
)


def embed_text(text: str) -> list[float]:
    """Return the embedding vector for a given text string."""
    response = _aoai.embeddings.create(model=AZURE_EMBEDDING_DEPLOYMENT, input=text)
    return response.data[0].embedding
