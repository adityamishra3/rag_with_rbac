import io
from pypdf import PdfReader
from docx import Document


def extract_text_from_pdf(data: bytes) -> str:
    """Extract all text from a PDF file given its raw bytes."""
    reader = PdfReader(io.BytesIO(data))
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n\n".join(pages)


def extract_text_from_docx(data: bytes) -> str:
    """Extract all paragraph text from a Word (.docx) file given its raw bytes."""
    doc = Document(io.BytesIO(data))
    paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
    return "\n\n".join(paragraphs)


def extract_text(filename: str, data: bytes) -> str:
    """
    Dispatch to the correct extractor based on file extension.
    Supports .pdf and .docx. Falls back to UTF-8 plain-text for anything else.
    """
    lower = filename.lower()
    if lower.endswith(".pdf"):
        return extract_text_from_pdf(data)
    if lower.endswith(".docx"):
        return extract_text_from_docx(data)
    # Plain text / markdown fallback
    return data.decode("utf-8", errors="replace")
