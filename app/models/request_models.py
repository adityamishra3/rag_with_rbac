from pydantic import BaseModel


class QueryRequest(BaseModel):
    query: str
    user_roles: list[str]


class IngestRequest(BaseModel):
    title: str
    content: str
    allowed_roles: list[str]
