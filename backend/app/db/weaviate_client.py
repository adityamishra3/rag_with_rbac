import weaviate
from app.core.config import WEAVIATE_HOST, WEAVIATE_PORT

_client: weaviate.WeaviateClient | None = None


def get_client() -> weaviate.WeaviateClient:
    """Return a lazily-initialised, reusable Weaviate client."""
    global _client
    if _client is None or not _client.is_connected():
        _client = weaviate.connect_to_local(host=WEAVIATE_HOST, port=WEAVIATE_PORT)
    return _client


def close_client() -> None:
    """Close and reset the global Weaviate client."""
    global _client
    if _client is not None:
        _client.close()
        _client = None
