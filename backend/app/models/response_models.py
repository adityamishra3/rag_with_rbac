from pydantic import BaseModel


class QueryResponse(BaseModel):
    answer: str
    sources: list[str] = []


class IngestResponse(BaseModel):
    message: str
    chunks_stored: int = 0
