from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.api.routes import query, ingest, health
from app.db.weaviate_client import get_client, close_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    get_client()   # connect on startup
    yield
    close_client() # disconnect on shutdown


app = FastAPI(title="RAG Platform", version="0.1.0", lifespan=lifespan)

app.include_router(health.router, prefix="/api/v1")
app.include_router(query.router, prefix="/api/v1")
app.include_router(ingest.router, prefix="/api/v1")
