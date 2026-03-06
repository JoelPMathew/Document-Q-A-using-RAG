# Document Q&A Bot Using RAG

A Retrieval-Augmented Generation (RAG) system built with FastAPI, Chroma, and HuggingFace Transformers.
It answers questions strictly based on the documents provided in the `docs/` folder.

## Features
- Ingests `.txt`, `.md`, and `.pdf` files.
- Generates embeddings using `sentence-transformers/all-MiniLM-L6-v2`.
- Stores vectors locally using **Chroma**.
- Answers using only the retrieved context via a local HuggingFace `google/flan-t5-base` model.
- Provides mandatory fallback if the answer is not in the text.
- Returns citations (document name + snippet + confidence score).

## Setup
1. Place any Markdown, TXT, or PDF files into the `docs/` directory.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the application:
   ```bash
   python main.py
   ```
   *Note: On first startup, the app will automatically parse `docs/`, build the Chroma index, and download the HuggingFace models (which may take a few minutes).*

## Sample API Requests

### 1. Question with Answer in Context
**Request:**
```bash
curl -X POST "http://localhost:8000/ask" \
     -H "Content-Type: application/json" \
     -d '{"question":"What is the remote work policy?", "top_k": 3}'
```

**Expected Output:**
```json
{
  "answer": "Employees are allowed to work remotely up to 3 days a week.",
  "sources": [
    {
      "document": "policies.md",
      "snippet": "## 1. Remote Work Policy\nEmployees are allowed to work remotely up to 3 days a week. The core working hours are 10:00 AM to 3:00 PM EST, during whi...",
      "score": 0.72
    }
  ],
  "confidence": "high"
}
```

### 2. Question NOT in Context (Mandatory Fallback)
**Request:**
```bash
curl -X POST "http://localhost:8000/ask" \
     -H "Content-Type: application/json" \
     -d '{"question":"What is the company policy on bringing pets to the office?", "top_k": 3}'
```

**Expected Output:**
```json
{
  "answer": "I could not find this in the provided documents. Can you share the relevant document?",
  "sources": [],
  "confidence": "low"
}
```
