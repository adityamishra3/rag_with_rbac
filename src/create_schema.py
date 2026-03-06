import weaviate
from weaviate.classes.config import Configure, Property, DataType

client = weaviate.connect_to_local()

collection_name = "Documents"

if collection_name not in client.collections.list_all():
    client.collections.create(
        name=collection_name,
        vectorizer_config=Configure.Vectorizer.none(),
        properties=[
            Property(name="title", data_type=DataType.TEXT),
            Property(name="content", data_type=DataType.TEXT),
            Property(name="allowed_roles", data_type=DataType.TEXT_ARRAY),
        ],
    )
    print("Collection created")
else:
    print("Collection already exists")

client.close()