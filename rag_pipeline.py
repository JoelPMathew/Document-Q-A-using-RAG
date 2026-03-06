from typing import Dict, Any, List
import torch
from transformers import pipeline, AutoModelForSeq2SeqLM, AutoTokenizer
from loguru import logger

from vector_store import VectorStore

class RAGPipeline:
    def __init__(self, model_name: str = "google/flan-t5-base"):
        self.vector_store = VectorStore()
        self.model_name = model_name
        self._init_llm()
        
    def _init_llm(self):
        """Initializes the local HuggingFace LLM for generation."""
        logger.info(f"Loading generative model: {self.model_name}")
        try:
             self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
             self.model = AutoModelForSeq2SeqLM.from_pretrained(self.model_name)
             
             # Setup pipeline
             # Determine device (MPS for Apple Silicon, CUDA for NVIDIA, else CPU)
             device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
             logger.info(f"Using device: {device}")
             
             self.generator = pipeline(
                 "text2text-generation",
                 model=self.model,
                 tokenizer=self.tokenizer,
                 device=device
             )
             logger.info("LLM initialized successfully.")
        except Exception as e:
             logger.error(f"Failed to load generative model: {e}")
             raise e

    def _build_prompt(self, question: str, contexts: List[str]) -> str:
        """Constructs an instruction-based prompt."""
        # Using a very strict prompt to minimize hallucinations.
        context_str = "\n\n".join([f"Context {i+1}:\n{ctx}" for i, ctx in enumerate(contexts)])
        
        prompt = f"""Answer the following question using ONLY the context provided below.
If the answer is not contained within the provided context, you MUST respond exactly with:
"I could not find this in the provided documents. Can you share the relevant document?"
Do not add any additional conversational text or internal knowledge.

Context Information:
{context_str}

Question: {question}

Answer:"""
        return prompt

    def _calculate_confidence(self, scores: List[float]) -> str:
        """Determines a qualitative confidence level based on retrieval scores."""
        if not scores:
            return "low"
            
        max_score = max(scores)
        
        # Qualitative thresholds based on Cosine Similarity (0 to 1, where 1 is exact)
        if max_score > 0.11:
            return "high"
        elif max_score > 0.08:
            return "medium"
        else:
            return "low"

    def ask(self, question: str, top_k: int = 3) -> Dict[str, Any]:
        """End-to-end RAG answer generation."""
        logger.info(f"Received question: {question}")
        
        # 1. Retrieve
        results = self.vector_store.search(question, top_k=top_k)
        
        # Format sources
        sources = []
        contexts = []
        scores = []
        
        for doc, score in results:
            contexts.append(doc["text"])
            scores.append(score)
            
            # Format snippet specifically
            # Truncate to first 150 chars as the snippet for citation
            snippet = (doc["text"][:147] + "...") if len(doc["text"]) > 150 else doc["text"]
            
            sources.append({
                "document": doc["metadata"].get("source", "Unknown"),
                "snippet": snippet,
                "score": float(score)  # Ensure JSON serializable
            })

        # Generate confidence mapping
        confidence = self._calculate_confidence(scores)

        # 2. Check if context was retrieved at all. Or if scores are incredibly weak.
        # Fallback early.
        if not contexts or confidence == "low":
            logger.info("Retrieval returned empty or terribly low confidence results. Triggering immediate fallback.")
            return {
                 "answer": "I could not find this in the provided documents. Can you share the relevant document?",
                 "sources": sources,
                 "confidence": "low"
            }

        # 3. Formulate Prompt
        prompt = self._build_prompt(question, contexts)
        logger.debug(f"Generated prompt length: {len(prompt)} chars")

        # 4. Generate
        logger.info("Generating answer with LLM...")
        try:
            # We restrict length to keep it snappy. You can configure max_new_tokens as needed.
            response = self.generator(
                prompt,
                max_new_tokens=150,
                num_return_sequences=1,
                do_sample=False  # Greedy decoding for facts
            )
            answer = response[0]['generated_text'].strip()
            
            # Additional safety check to enforce fallback specifically on the LLM side.
            if answer.lower() == "i could not find this in the provided documents":
                confidence = "low" # Demote confidence if the LLM states it can't find it.
            
        except Exception as e:
            logger.error(f"Error during LLM generation: {e}")
            answer = "An error occurred while generating the answer."
            confidence = "low"
            
        logger.info(f"Generated answer: {answer}")

        return {
            "answer": answer,
            "sources": sources,
            "confidence": confidence
        }

if __name__ == "__main__":
    # Simple explicit test (requires docs and index built)
    rag = RAGPipeline()
    res = rag.ask("What is the refund policy?")
    print(res)
