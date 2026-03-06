# InsightBot: Neural Document Q&A (RAG)

InsightBot is a Retrieval-Augmented Generation (RAG) system that allows users to upload documents and query them using a local Large Language Model. It is designed to be self-contained, privacy-focused, and highly accurate, providing real-time citations and proactive workspace analysis.

---

## 🚀 Workflow Architecture

InsightBot follows a structured pipeline to ensure information is retrieved accurately and generated without hallucinations.

### 1. Document Ingestion & Chunking
*   **Module**: `ingest.py`
*   **Process**: Recursively scans the `docs/` directory for `.pdf`, `.txt`, and `.md` files.
*   **Strategy**: Uses `PyMuPDF` for high-fidelity PDF parsing.
*   **Chunking**: Documents are split into **400-character chunks** with a **100-character overlap**. This small chunk size is optimized for the context window of local models, ensuring no context is lost during generation.

### 2. Embeddings & Vector Store
*   **Module**: `vector_store.py`
*   **Model**: `sentence-transformers/all-MiniLM-L6-v2`
*   **Storage**: **FAISS** (Facebook AI Similarity Search).
*   **Process**: Each text chunk is converted into a high-dimensional vector and stored in a searchable index. Metadata (source file name, original text) is persisted alongside the vectors for citation generation.

### 3. Top-k Retrieval
*   **Module**: `rag_pipeline.py` (via `VectorStore.search`)
*   **Logic**: When a query is received, it is converted into an embedding. The system performs a cosine similarity search to retrieve the **Top-3 (k=3)** most relevant chunks.
*   **Scoring**: Only chunks meeting a specific similarity threshold are considered, preventing the model from using irrelevant data.

### 4. Answer Generation & Citations
*   **Module**: `rag_pipeline.py`
*   **Model**: `google/flan-t5-base` (Seq2Seq Transformer)
*   **Prompting**: A strict instruction prompt forces the LLM to use *only* the retrieved context.
*   **No Hallucinations**: If the model finds no relevant data, it triggers a mandatory fallback: *"I could not find this in the provided documents."*
*   **Citations**: The system extracts the source filename and snippet for every chunk used, calculating a confidence score (`high`, `medium`, `low`) for the final answer.

---

## 🛠️ Proactive Workspace Analysis
Unique to InsightBot, we've implemented a **Neural Overview** feature:
1.  Upon file upload, the system automatically triggers `analyze_workspace()`.
2.  The LLM scans filenames and metadata to generate a summary of the new knowledge base.
3.  The summary is presented as the initial chat message, providing instant insight before the user even asks a question.

---

## 📊 Sample API & Examples

### Endpoint: `POST /ask`
**Request:**
```json
{
  "question": "What is the policy for remote work?",
  "top_k": 3
}
```

**Successful Output:**
```json
{
  "answer": "Employees are allowed to work remotely up to 3 days per week. Sources cite that core hours are 10 AM to 3 PM.",
  "sources": [
    {
      "document": "policies.md",
      "snippet": "## Remote Work Policy... Employees work remotely 3 days...",
      "score": 0.582
    }
  ],
  "confidence": "high"
}
```

**Fallback Output:**
```json
{
  "answer": "I could not find this in the provided documents. Can you share the relevant document?",
  "sources": [],
  "confidence": "low"
}
```

---

## 📦 Deliverables & Dependencies

### Core Files
- `main.py`: FastAPI server & API endpoints.
- `rag_pipeline.py`: Generation logic & LLM orchestration.
- `vector_store.py`: FAISS index management.
- `ingest.py`: Document parsing & chunking.
- `requirements.txt`: Python environment specification.

### Key Function Dependencies
| Method | Responsibility | Location |
| :--- | :--- | :--- |
| `load_and_chunk_documents` | File parsing & text splitting | `ingest.py` |
| `build_vector_store` | Index initialization/rebuilding | `vector_store.py` |
| `RAGPipeline.ask` | Retrieval + Generation orchestration | `rag_pipeline.py` |
| `analyze_workspace` | Proactive summary generation | `rag_pipeline.py` |
| `upload_documents` | File handling & hot-reloading index | `main.py` |

### System Requirements
```text
fastapi, uvicorn, pydantic
torch, transformers, sentence-transformers
faiss-cpu, pymupdf
loguru (Logging & Error Handling)
```

---

## 🛡️ Logging & Error Handling
- **Systemic Logging**: Powered by `loguru`, every retrieval event, model load, and API request is tracked with timestamps.
- **Graceful Failures**: 
  - If a PDF is corrupted, the system skips it and logs a warning rather than crashing.
  - If the LLM fails to load, the API returns a `503 Service Unavailable` with a clear message.
  - Runtime errors during generation are caught and mapped to "Low Confidence" responses to maintain UI stability.

---

## 💻 Working with the UI
1. Start the Backend: `python -m uvicorn main:app --reload`
2. Start the Frontend: `cd nexus-ai-workspace && npm run dev`
3. Access: `http://localhost:3000`
