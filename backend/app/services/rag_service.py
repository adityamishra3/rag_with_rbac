from app.services.embedding_service import embed_text
from app.services.vector_service import search_documents
from app.services.llm_service import generate_answer


def rag_query(query: str, user_roles: list[str]) -> tuple[str, list[dict]]:
    """
    Full RAG pipeline:
      1. Embed the query.
      2. Retrieve relevant documents filtered by RBAC roles.
      3. Generate an answer from the retrieved context.

    Returns:
        A tuple of (answer, source_list) where each source has title, content, relevance.
    """
    query_vector = embed_text(query)
    source_docs = search_documents(query_vector, user_roles)

    if not source_docs:
        return "No results found. Either this topic doesn't exist in our knowledge base or you don't have access to it.", []

    context = "\n\n".join(doc["content"] for doc in source_docs)
    answer = generate_answer(query, context)
    return answer, source_docs
