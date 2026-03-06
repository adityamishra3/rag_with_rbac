"""
Bulk-ingest all documents from the data/ folder into Weaviate.
Run from the project root:  python scripts/ingest_docs.py

Each file is assigned a set of allowed_roles defined in FILE_ROLES below.
Add or change entries there to control who can query each document.
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.config import WEAVIATE_HOST, WEAVIATE_PORT, COLLECTION_NAME
from app.db.weaviate_client import get_client, close_client
from app.services.embedding_service import embed_text
from app.services.vector_service import insert_document
from app.utils.document_parser import extract_text
from app.utils.chunking import chunk_text

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")

# Map filename → allowed roles. Filenames not listed fall back to DEFAULT_ROLES.
FILE_ROLES: dict[str, list[str]] = {
    "Damaged_Return_Inspection_Report.docx":      ["warehouse_staff", "management"],
    "Reverse_Logistics_Compliance_Policy.docx":   ["management", "compliance"],
    "Reverse_Logistics_Workflow_Overview.docx":   ["warehouse_staff", "management"],
    "SOP_Returns_Processing_Warehouse.docx":      ["warehouse_staff", "management"],
    "Warehouse_Returns_Training_Guide.docx":      ["warehouse_staff"],
}
DEFAULT_ROLES: list[str] = ["management"]


def ingest_file(path: str) -> int:
    filename = os.path.basename(path)
    roles = FILE_ROLES.get(filename, DEFAULT_ROLES)
    title = os.path.splitext(filename)[0].replace("_", " ")

    with open(path, "rb") as f:
        raw = f.read()

    text = extract_text(filename, raw)
    if not text.strip():
        print(f"  ⚠  No text extracted — skipping.")
        return 0

    chunks = chunk_text(text)
    for idx, chunk in enumerate(chunks):
        vector = embed_text(chunk)
        insert_document(
            title=f"{title} [chunk {idx + 1}/{len(chunks)}]",
            content=chunk,
            allowed_roles=roles,
            vector=vector,
        )
    return len(chunks)


def main() -> None:
    files = [
        f for f in os.listdir(DATA_DIR)
        if f.lower().endswith((".pdf", ".docx", ".txt", ".md"))
    ]

    if not files:
        print("No documents found in data/.")
        return

    print(f"Connecting to Weaviate at {WEAVIATE_HOST}:{WEAVIATE_PORT} …")
    get_client()  # warm up singleton
    print(f"Collection: {COLLECTION_NAME}\n")

    total_chunks = 0
    for filename in sorted(files):
        path = os.path.join(DATA_DIR, filename)
        print(f"📄 {filename}")
        n = ingest_file(path)
        print(f"   ✅ {n} chunk(s) stored  |  roles: {FILE_ROLES.get(filename, DEFAULT_ROLES)}")
        total_chunks += n

    close_client()
    print(f"\nDone. {len(files)} file(s) → {total_chunks} chunk(s) ingested.")


if __name__ == "__main__":
    main()
