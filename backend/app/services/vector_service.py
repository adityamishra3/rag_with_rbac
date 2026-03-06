from weaviate.classes.query import Filter
from app.db.weaviate_client import get_client
from app.core.config import COLLECTION_NAME


# Only return chunks whose vector distance is within this threshold.
_DISTANCE_THRESHOLD = 0.45


def search_documents(query_vector: list[float], user_roles: list[str], limit: int = 5) -> list[dict]:
    """Return structured source dicts matching the query vector and user roles."""
    client = get_client()
    collection = client.collections.get(COLLECTION_NAME)
    response = collection.query.near_vector(
        near_vector=query_vector,
        limit=limit,
        distance=_DISTANCE_THRESHOLD,
        filters=Filter.by_property("allowed_roles").contains_any(user_roles),
        return_metadata=["distance"],
    )
    results = []
    for obj in response.objects:
        raw_title: str = obj.properties.get("title", "Unknown Document")  # type: ignore
        # Strip " [chunk N/M]" suffix added during ingestion
        clean_title = raw_title.split(" [chunk ")[0].strip()
        distance = obj.metadata.distance if obj.metadata else 1.0
        relevance = round((1.0 - distance) * 100)
        results.append({
            "title": clean_title,
            "content": obj.properties["content"],
            "relevance": relevance,
        })
    return results


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
