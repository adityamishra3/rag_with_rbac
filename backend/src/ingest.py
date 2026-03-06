import os
import weaviate
from dotenv import load_dotenv
from openai import AzureOpenAI

load_dotenv()

client_aoai = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version=os.getenv("AZURE_EMBEDDING_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT", ""),
)

embedding_model = os.getenv("AZURE_EMBEDDING_DEPLOYMENT", "text-embedding-3-large")

text = "Employees can take 20 leaves per year."
embedding = client_aoai.embeddings.create(
    model=embedding_model,
    input = text
).data[0].embedding

client = weaviate.connect_to_local()
collection = client.collections.get("Documents")
collection.data.insert(
    properties={
        "title": "HR Leave Policy",
        "content": text,
        "allowed_roles": ["hr", "manager"]
    },
    vector=embedding
)

print("Document inserted!")

client.close()