from pydantic import BaseModel


class SourceItem(BaseModel):
    title: str
    content: str
    relevance: int  # 0-100 percentage


class QueryResponse(BaseModel):
    answer: str
    sources: list[SourceItem] = []


class IngestResponse(BaseModel):
    message: str
    chunks_stored: int = 0
