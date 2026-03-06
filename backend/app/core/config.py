import os
from dotenv import load_dotenv

load_dotenv()

AZURE_OPENAI_API_KEY: str = os.getenv("AZURE_OPENAI_API_KEY", "")
AZURE_OPENAI_ENDPOINT: str = os.getenv("AZURE_OPENAI_ENDPOINT", "")
AZURE_OPENAI_API_VERSION: str = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-01")
AZURE_EMBEDDING_API_VERSION: str = os.getenv("AZURE_EMBEDDING_API_VERSION", "2024-02-01")
AZURE_EMBEDDING_DEPLOYMENT: str = os.getenv("AZURE_EMBEDDING_DEPLOYMENT", "text-embedding-3-large")
AZURE_OPENAI_DEPLOYMENT_NAME: str = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o")

WEAVIATE_HOST: str = os.getenv("WEAVIATE_HOST", "localhost")
WEAVIATE_PORT: int = int(os.getenv("WEAVIATE_PORT", "8080"))

COLLECTION_NAME: str = os.getenv("COLLECTION_NAME", "Documents")
