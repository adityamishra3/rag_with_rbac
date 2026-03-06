from fastapi import APIRouter
from app.models.request_models import QueryRequest
from app.models.response_models import QueryResponse
from app.services.rag_service import rag_query

router = APIRouter()


@router.post("/query", response_model=QueryResponse, tags=["rag"])
async def query_endpoint(request: QueryRequest) -> QueryResponse:
    answer, sources = rag_query(request.query, request.user_roles)
    return QueryResponse(answer=answer, sources=sources)
