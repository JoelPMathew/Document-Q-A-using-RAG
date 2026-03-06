import os
import json
import pickle
from typing import List, Dict, Any, Tuple
from loguru import logger
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

from ingest import load_and_chunk_documents

FAISS_PARAMS_DIR = "faiss_db"
INDEX_FILE = os.path.join(FAISS_PARAMS_DIR, "index.faiss")
METADATA_FILE = os.path.join(FAISS_PARAMS_DIR, "metadata.pkl")

EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

class VectorStore:
    def __init__(self, index_file: str = INDEX_FILE, metadata_file: str = METADATA_FILE):
        self.index_file = index_file
        self.metadata_file = metadata_file
        
        if not os.path.exists(FAISS_PARAMS_DIR):
             os.makedirs(FAISS_PARAMS_DIR)
             
        logger.info(f"Loading embedding model: {EMBEDDING_MODEL_NAME}")
        self.embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
        # The hidden size of all-MiniLM-L6-v2 is 384
        self.dimension = 384 
        
        self.index = None
        self.document_metadata = [] # List of dicts matching FAISS internal IDs (0-indexed)
        self.load_index()

    def load_index(self):
         """Loads the FAISS index and metadata from disk if they exist."""
         if os.path.exists(self.index_file) and os.path.exists(self.metadata_file):
             logger.info(f"Loading existing FAISS index from {self.index_file}")
             self.index = faiss.read_index(self.index_file)
             with open(self.metadata_file, "rb") as f:
                 self.document_metadata = pickle.load(f)
             logger.info(f"Loaded {self.index.ntotal} vectors from index.")
         else:
             # IndexFlatIP is inner product. Since sentence-transformers normalizes output,
             # this is mathematically equivalent to cosine similarity.
             logger.info("Initializing new empty FAISS index (IndexFlatIP for Cosine Similarity)")
             self.index = faiss.IndexFlatIP(self.dimension)
             self.document_metadata = []

    def save_index(self):
         """Saves the FAISS index and metadata to disk."""
         logger.info(f"Saving FAISS index to {self.index_file}")
         faiss.write_index(self.index, self.index_file)
         with open(self.metadata_file, "wb") as f:
             pickle.dump(self.document_metadata, f)

    def embed_texts(self, texts: List[str]) -> np.ndarray:
        """Generates embeddings for a list of texts and returns a numpy array."""
        embeddings = self.embedding_model.encode(texts, show_progress_bar=False)
        return np.array(embeddings, dtype=np.float32)

    def add_documents(self, documents: List[Dict[str, Any]]):
        """Adds documents to the vector store."""
        if not documents:
            logger.warning("No documents provided to add to vector store.")
            return

        texts = [doc["text"] for doc in documents]
        
        logger.info(f"Generating embeddings for {len(texts)} chunks...")
        embeddings = self.embed_texts(texts)
        
        # In FAISS, we just add the embeddings, they get sequential IDs 0, 1, 2...
        logger.info(f"Adding {len(texts)} chunks to FAISS index...")
        self.index.add(embeddings)
        
        # Save our metadata sequentially to match the FAISS IDs
        for doc in documents:
             # Add the text directly into our metadata lookup for retrieval later
             meta_entry = {
                 "id": doc["id"],
                 "text": doc["text"],
                 "metadata": doc["metadata"]
             }
             self.document_metadata.append(meta_entry)
             
        self.save_index()
        logger.info(f"Successfully added {len(texts)} chunks. Total: {self.index.ntotal}")

    def search(self, query: str, top_k: int = 3) -> List[Tuple[Dict[str, Any], float]]:
        """Searches the vector store for the most relevant documents given a query.
        Returns a list of tuples containing (document_chunk_metadata, similarity_score)."""
        if not self.index or self.index.ntotal == 0:
            logger.warning("Search called on an empty index.")
            return []
            
        logger.debug(f"Generating embedding for query: '{query}'")
        query_embedding = self.embed_texts([query])
        
        logger.debug(f"Searching for top {top_k} results in FAISS...")
        # D is distances (inner product = cosine similarity for normalized vectors)
        # I is the indices mapping to our document_metadata array
        distances, indices = self.index.search(query_embedding, top_k)
        
        formatted_results = []
        for i, idx in enumerate(indices[0]):
             if idx != -1 and idx < len(self.document_metadata):
                 similarity_score = float(distances[0][i])
                 
                 # Assemble the chunk info formatting expected by rag_pipeline
                 chunk_data = self.document_metadata[idx]
                 chunk_info = {
                     "text": chunk_data["text"],
                     "metadata": chunk_data["metadata"],
                     "id": chunk_data["id"]
                 }
                 # Clamp similarity just to be safe (should be <= 1.0)
                 normalized_score = max(0.0, min(1.0, similarity_score))
                 formatted_results.append((chunk_info, normalized_score))
                 
        return formatted_results


def build_vector_store():
    """Helper function to run the full ingestion and embedding pipeline."""
    # Since FAISS doesn't do robust upserts easily in the simple flat index, 
    # we'll recreate it from scratch on startup for this demo implementation if docs are present.
    logger.info("Starting ingest to vector store pipeline...")
    docs = load_and_chunk_documents()
    
    if docs:
        store = VectorStore()
        # To avoid duplicating entries if running repeatedly, we reset the index and metadata here
        # This is fine for a sample application but would need a real ID mapping for production database.
        store.index = faiss.IndexFlatIP(store.dimension)
        store.document_metadata = []
        
        store.add_documents(docs)
        logger.info("Pipeline complete.")
    else:
        logger.warning("No documents loaded. Vector store not updated.")

if __name__ == "__main__":
    build_vector_store()
