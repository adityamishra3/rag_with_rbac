"""
Create (or verify) the Weaviate schema for the RAG platform.
Run from the project root:  python scripts/create_schema.py
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import weaviate
from weaviate.classes.config import Configure, Property, DataType
from app.core.config import WEAVIATE_HOST, WEAVIATE_PORT, COLLECTION_NAME


def create_schema() -> None:
    client = weaviate.connect_to_local(host=WEAVIATE_HOST, port=WEAVIATE_PORT)
    try:
        if COLLECTION_NAME not in client.collections.list_all():
            client.collections.create(
                name=COLLECTION_NAME,
                vectorizer_config=Configure.Vectorizer.none(),
                properties=[
                    Property(name="title", data_type=DataType.TEXT),
                    Property(name="content", data_type=DataType.TEXT),
                    Property(name="allowed_roles", data_type=DataType.TEXT_ARRAY),
                ],
            )
            print(f"Collection '{COLLECTION_NAME}' created.")
        else:
            print(f"Collection '{COLLECTION_NAME}' already exists.")
    finally:
        client.close()


if __name__ == "__main__":
    create_schema()
