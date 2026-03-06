import os
import weaviate
from dotenv import load_dotenv
from openai import AzureOpenAI
from weaviate.classes.query import Filter

load_dotenv()

# Azure OpenAI client
aoai = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT",""),
)

embedding_deployment = os.getenv("AZURE_EMBEDDING_DEPLOYMENT", "text-embedding-3-large")
chat_deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")

query = "How many leaves do employees get?"

# Step 1: embed query
query_vector = aoai.embeddings.create(
    model=embedding_deployment,
    input=query
).data[0].embedding

# Step 2: user roles
user_roles = ["hr"]

# Step 3: retrieve documents
client = weaviate.connect_to_local()
collection = client.collections.get("Documents")

response = collection.query.near_vector(
    near_vector=query_vector,
    limit=5,
    filters=Filter.by_property("allowed_roles").contains_any(user_roles)
)

documents = [obj.properties["content"] for obj in response.objects]

client.close()

# Step 4: build context
context = "\n\n".join(documents) # type: ignore

# Step 5: ask GPT
completion = aoai.chat.completions.create(
    model=chat_deployment or "gpt-4",
    messages=[
        {
            "role": "system",
            "content": "You answer questions using the provided company documents."
        },
        {
            "role": "user",
            "content": f"""
Answer the question using only the context below.

Context:
{context}

Question:
{query}
"""
        }
    ]
)

print("\nANSWER:\n")
print(completion.choices[0].message.content)