from weaviate.classes.query import Filter
from app.db.weaviate_client import get_client
from app.core.config import COLLECTION_NAME


# Only return chunks whose vector distance is within this threshold.
# Lower = stricter relevance. 0.30 filters out loosely related chunks.
_DISTANCE_THRESHOLD = 0.30


def search_documents(query_vector: list[float], user_roles: list[str], limit: int = 5) -> list[str]:
    """Return document content strings matching the query vector and user roles."""
    client = get_client()
    collection = client.collections.get(COLLECTION_NAME)
    response = collection.query.near_vector(
        near_vector=query_vector,
        limit=limit,
        distance=_DISTANCE_THRESHOLD,
        filters=Filter.by_property("allowed_roles").contains_any(user_roles),
        return_metadata=["distance"],
    )
    return [obj.properties["content"] for obj in response.objects]  # type: ignore


def insert_document(title: str, content: str, allowed_roles: list[str], vector: list[float]) -> None:
    """Insert a single document into the vector store."""
    client = get_client()
    collection = client.collections.get(COLLECTION_NAME)
    collection.data.insert(
        properties={
            "title": title,
            "content": content,
            "allowed_roles": allowed_roles,
        },
        vector=vector,
    )
