import os
from pathlib import Path
from typing import List, Dict, Any
import fitz  # PyMuPDF
from loguru import logger

DOCS_DIR = "docs"
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200

def parse_pdf(file_path: str) -> str:
    """Extracts text from a PDF file."""
    text = ""
    try:
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text()
    except Exception as e:
        logger.error(f"Error reading PDF {file_path}: {e}")
    return text

def parse_text(file_path: str) -> str:
    """Extracts text from a txt or md file."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        logger.error(f"Error reading text file {file_path}: {e}")
        return ""

def split_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    """Splits text into chunks of given size with overlap."""
    if not text:
        return []
        
    chunks = []
    start = 0
    text_len = len(text)
    
    while start < text_len:
        end = start + chunk_size
        
        # If we're not at the end, try to find a natural break point (newline or space)
        if end < text_len:
            # Look backwards for a newline
            last_newline = text.rfind('\n', start, end)
            if last_newline != -1 and last_newline > start + (chunk_size // 2):
                end = last_newline + 1
            else:
                # Look backwards for a space
                last_space = text.rfind(' ', start, end)
                if last_space != -1 and last_space > start + (chunk_size // 2):
                    end = last_space + 1
                    
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
            
        start = end - overlap if end < text_len else text_len
        
    return chunks

def load_and_chunk_documents() -> List[Dict[str, Any]]:
    """Loads all supported documents from DOCS_DIR and splits them into chunks."""
    if not os.path.exists(DOCS_DIR):
        logger.warning(f"Directory '{DOCS_DIR}' not found. Creating it.")
        os.makedirs(DOCS_DIR)
        return []

    documents = []
    
    for filepath in Path(DOCS_DIR).glob("**/*"):
        if filepath.is_file():
            text = ""
            ext = filepath.suffix.lower()
            
            if ext == ".pdf":
                logger.info(f"Parsing PDF: {filepath}")
                text = parse_pdf(str(filepath))
            elif ext in [".txt", ".md"]:
                logger.info(f"Parsing text file: {filepath}")
                text = parse_text(str(filepath))
            else:
                logger.debug(f"Skipping unsupported file type: {filepath}")
                continue
                
            if text:
                chunks = split_text(text)
                for i, chunk in enumerate(chunks):
                    documents.append({
                        "id": f"{filepath.name}_chunk_{i}",
                        "text": chunk,
                        "metadata": {
                            "source": str(filepath.name),
                            "chunk_index": i
                        }
                    })
                logger.info(f"Created {len(chunks)} chunks from {filepath.name}")
            else:
                logger.warning(f"No text extracted from {filepath.name}")
                
    return documents

if __name__ == "__main__":
    docs = load_and_chunk_documents()
    print(f"Total chunks created: {len(docs)}")
    if docs:
        print(f"Sample chunk metadata: {docs[0]['metadata']}")
        print(f"Sample chunk text: {docs[0]['text'][:100]}...")
