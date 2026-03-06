from fastapi import APIRouter, Form, UploadFile, File, HTTPException, status
from app.models.response_models import IngestResponse
from app.services.embedding_service import embed_text
from app.services.vector_service import insert_document
from app.utils.document_parser import extract_text
from app.utils.chunking import chunk_text

router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md"}


@router.post("/ingest", response_model=IngestResponse, tags=["ingest"])
async def ingest_endpoint(
    file: UploadFile = File(..., description="PDF, DOCX, or plain-text file to ingest"),
    title: str = Form(..., description="Human-readable title for the document"),
    allowed_roles: str = Form(..., description="Comma-separated roles, e.g. hr,manager"),
) -> IngestResponse:
    # Validate extension
    filename = file.filename or ""
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    roles = [r.strip() for r in allowed_roles.split(",") if r.strip()]
    if not roles:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one allowed_role is required.",
        )

    raw = await file.read()
    text = extract_text(filename, raw)

    if not text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not extract any text from the uploaded file.",
        )

    chunks = chunk_text(text)

    for idx, chunk in enumerate(chunks):
        vector = embed_text(chunk)
        insert_document(
            title=f"{title} [chunk {idx + 1}/{len(chunks)}]",
            content=chunk,
            allowed_roles=roles,
            vector=vector,
        )

    return IngestResponse(
        message=f"'{filename}' ingested successfully.",
        chunks_stored=len(chunks),
    )
