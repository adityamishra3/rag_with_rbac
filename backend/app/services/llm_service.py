from openai import AzureOpenAI
from app.core.config import (
    AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_ENDPOINT,
    AZURE_OPENAI_API_VERSION,
    AZURE_OPENAI_DEPLOYMENT_NAME,
)

_aoai = AzureOpenAI(
    api_key=AZURE_OPENAI_API_KEY,
    api_version=AZURE_OPENAI_API_VERSION,
    azure_endpoint=AZURE_OPENAI_ENDPOINT,
)

_SYSTEM_PROMPT = """\
You are a company document assistant. Your job is to answer questions using \
the content of the documents provided in the context below.

Rules:
- Base your answer on the context provided. You may synthesize and summarise \
information from across multiple context chunks to form a complete answer.
- You may use reasonable inference when the answer is clearly implied by the context.
- Do NOT use outside knowledge that is unrelated to what is in the context.
- If the context genuinely contains no relevant information whatsoever, respond \
with exactly: "The documents you have access to do not contain information about this topic."
- Format your answer clearly using markdown — use bullet points, bold headings, \
or numbered lists where they improve readability.
- Keep answers concise and professional.
"""

_NO_ANSWER = "The documents you have access to do not contain information about this topic."


def generate_answer(query: str, context: str) -> str:
    """Call the chat completion API and return the model's answer."""
    completion = _aoai.chat.completions.create(
        model=AZURE_OPENAI_DEPLOYMENT_NAME,
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"Context documents:\n{context}\n\n"
                    f"Question: {query}\n\n"
                    f"Answer strictly from the context above. "
                    f"If the answer is not explicitly present, say: \"{_NO_ANSWER}\""
                ),
            },
        ],
        temperature=0.0,
    )
    return completion.choices[0].message.content or _NO_ANSWER
