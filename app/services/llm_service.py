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
You are a company document assistant. Your ONLY job is to answer questions \
using the exact content of the documents provided in the context below.

Strict rules you must follow:
- Base your answer SOLELY on what is explicitly written in the context.
- Do NOT infer, deduce, assume, or extrapolate anything not stated in the context.
- Do NOT use any outside knowledge, even if you believe it is correct.
- If the context does not contain a direct answer to the question, respond with \
exactly: "The documents you have access to do not contain information about this topic."
- Never paraphrase or reinterpret the question to fit what the context does contain.
- Never offer a "based on related information" or partial answer.
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
