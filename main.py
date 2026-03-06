from typing import List, Optional
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, ConfigDict
from loguru import logger
import uvicorn

from vector_store import build_vector_store
from rag_pipeline import RAGPipeline

# Request/Response Models
class AskRequest(BaseModel):
    question: str
    top_k: Optional[int] = 3
    
    # allow arbitrary types to handle edge cases easily
    model_config = ConfigDict(extra='ignore')

class Citation(BaseModel):
    document: str
    snippet: str
    score: float

class AskResponse(BaseModel):
    answer: str
    sources: List[Citation]
    confidence: str


# FastAPI App
app = FastAPI(
    title="Document Q&A Bot via RAG",
    description="Answers questions strictly from your local `docs/` folder.",
    version="1.0.0"
)

# Initialize RAG Pipeline lazily to avoid immediate crash on start if no docs
rag_pipeline: Optional[RAGPipeline] = None

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up FastAPI application...")
    logger.info("Triggering vector store index build on startup...")
    try:
         build_vector_store()
    except Exception as e:
         logger.warning(f"Could not build vector store on startup: {e}")
         
    logger.info("Loading generative LLM model (this might take a few moments)...")
    global rag_pipeline
    try:
        rag_pipeline = RAGPipeline()
        logger.info("RAG pipeline fully warmed up and ready.")
    except Exception as e:
        logger.error(f"Failed to load RAG Pipeline. Ensure models format correctly. Error: {e}")

@app.post("/ask", response_model=AskResponse)
async def ask_question(request: AskRequest):
    """
    Answers a question based solely on the documents in the `docs/` folder.
    Returns: answer string, sources, and a confidence level (high | medium | low).
    """
    logger.info(f"Received request: {request.question}")
    
    if not request.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question string cannot be empty."
        )

    if not rag_pipeline:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="RAG model is still initializing or failed to load. Please try again later."
        )

    try:
        result = rag_pipeline.ask(request.question, top_k=request.top_k)
        
        # Verify result dictionary
        if not all(k in result for k in ("answer", "sources", "confidence")):
            raise ValueError("RAG pipeline returned malformed output.")
            
        return AskResponse(
            answer=result["answer"],
            sources=[Citation(**src) for src in result["sources"]],
            confidence=result["confidence"]
        )

    except Exception as e:
        logger.error(f"Error processing question '{request.question}': {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while generating the answer: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
