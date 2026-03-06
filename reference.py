"""
RAG (Retrieval-Augmented Generation) System
Optimized for Antigravity Domain
Uses: HuggingFace Transformers + FAISS Vector Database
"""

# ── Install dependencies (run once) ──────────────────────────────────────────
# pip install transformers sentence-transformers faiss-cpu torch accelerate

import warnings
warnings.filterwarnings("ignore")

import numpy as np
from typing import List, Dict, Tuple
from dataclasses import dataclass, field


# ═══════════════════════════════════════════════════════════════════════════════
# 1. KNOWLEDGE BASE  –  Antigravity Domain Documents
# ═══════════════════════════════════════════════════════════════════════════════

ANTIGRAVITY_CORPUS: List[Dict] = [
    {
        "id": "ag_001",
        "title": "General Relativity and Gravity Manipulation",
        "text": (
            "Einstein's General Theory of Relativity describes gravity not as a force "
            "but as the curvature of spacetime caused by mass and energy. Antigravity, "
            "in the relativistic sense, refers to the creation of negative spacetime "
            "curvature, which would cause repulsion instead of attraction. The cosmological "
            "constant (Λ) introduced by Einstein represents a form of dark energy that "
            "produces repulsive gravitational effects on large cosmic scales."
        ),
    },
    {
        "id": "ag_002",
        "title": "Casimir Effect and Quantum Vacuum Energy",
        "text": (
            "The Casimir effect demonstrates that quantum vacuum fluctuations produce "
            "measurable forces between closely spaced conducting plates. Some physicists "
            "theorise that engineering quantum vacuum energy could yield macroscopic "
            "antigravity effects. The zero-point energy density of the vacuum is estimated "
            "at ~10^113 J/m³, though harnessing it remains beyond current technology. "
            "Negative energy density, as seen in the Casimir geometry, is a prerequisite "
            "for certain exotic propulsion concepts."
        ),
    },
    {
        "id": "ag_003",
        "title": "Alcubierre Warp Drive",
        "text": (
            "Miguel Alcubierre proposed a theoretical spacetime metric in 1994 that "
            "contracts space in front of a vessel and expands it behind, effectively "
            "allowing faster-than-light travel without local violation of relativity. "
            "This warp bubble requires exotic matter with negative energy density — "
            "a form of gravitational repulsion within the bubble walls. The energy "
            "requirement has been progressively reduced in subsequent refinements, "
            "from a Jupiter-mass equivalent to potentially sub-gram scales with "
            "optimised geometries."
        ),
    },
    {
        "id": "ag_004",
        "title": "Gravitational Shielding Experiments",
        "text": (
            "Physicist Evgeny Podkletnov reported in 1992 that a rotating superconducting "
            "disc reduced the weight of objects above it by ~2%. Despite multiple replication "
            "attempts by NASA and ESA, the effect has not been reproducibly confirmed. "
            "Theoretical explanations invoking gravitomagnetism — the magnetic-like component "
            "of gravity in rotating frames, as described by frame-dragging in GR — suggest "
            "that rotating superconductors might couple weakly to gravitational fields, "
            "though consensus remains sceptical."
        ),
    },
    {
        "id": "ag_005",
        "title": "Dark Energy as Natural Antigravity",
        "text": (
            "Observational cosmology has confirmed that the universe's expansion is "
            "accelerating, driven by dark energy — an unknown component comprising ~68% "
            "of the total energy content of the universe. Dark energy has an equation "
            "of state w ≈ -1, meaning its pressure is negative, producing a repulsive "
            "gravitational effect. The ΛCDM model treats dark energy as a cosmological "
            "constant, while alternatives like quintessence posit a dynamic scalar field. "
            "Localising or amplifying dark energy effects is a speculative but active "
            "area of theoretical physics."
        ),
    },
    {
        "id": "ag_006",
        "title": "Electrogravitic and Biefeld-Brown Effect",
        "text": (
            "The Biefeld–Brown effect describes the thrust produced by high-voltage "
            "asymmetric capacitors, observed by Thomas Townsend Brown in the 1920s. "
            "While early researchers speculated an electromagnetic-gravitational coupling, "
            "modern analysis attributes the thrust primarily to ion wind (electrohydrodynamics). "
            "True electrogravitics would require a fundamental coupling between Maxwell's "
            "equations and the Einstein field equations beyond Standard Model physics. "
            "Lifter devices exploiting this effect can hover but require ambient air and "
            "do not function in vacuum, ruling out pure antigravity."
        ),
    },
    {
        "id": "ag_007",
        "title": "Negative Mass and Exotic Matter",
        "text": (
            "Negative mass is a hypothetical concept where an object has mass with a "
            "negative value, causing it to accelerate opposite to an applied force. "
            "Runaway acceleration — where a positive and negative mass pair continuously "
            "accelerate together — is a predicted consequence. Exotic matter with negative "
            "energy density is required for traversable wormholes (Morris-Thorne) and "
            "warp drives. Quantum field theory permits transient negative energy densities "
            "bounded by the quantum inequalities, limiting the extent to which negative "
            "energy can be sustained."
        ),
    },
    {
        "id": "ag_008",
        "title": "NASA Breakthrough Propulsion Physics Program",
        "text": (
            "NASA operated the Breakthrough Propulsion Physics (BPP) Program from 1996 "
            "to 2002, funding 12 research projects aimed at revolutionary propulsion "
            "concepts, including antigravity. The programme evaluated concepts such as "
            "quantum vacuum energy extraction, spacetime metric engineering, and inertia "
            "modification. No experimentally validated breakthrough emerged, but the "
            "programme produced important null results and rigorous evaluation frameworks. "
            "The successor NIAC (NASA Innovative Advanced Concepts) program continues "
            "funding speculative but scientifically grounded propulsion research."
        ),
    },
    {
        "id": "ag_009",
        "title": "Gravitoelectromagnetism and Frame Dragging",
        "text": (
            "Gravitoelectromagnetism (GEM) is the analogy between weak-field linearised "
            "gravity and electromagnetism. Frame dragging (the Lense-Thirring effect) — "
            "confirmed by Gravity Probe B in 2011 — shows that a rotating mass drags "
            "the local spacetime reference frame. Hypothetically, sufficiently intense "
            "frame dragging near rapidly rotating dense objects could create locally "
            "reduced effective gravity. Engineering gravitomagnetic fields strong enough "
            "for practical use would require mass-energy densities far beyond current "
            "technological capability."
        ),
    },
    {
        "id": "ag_010",
        "title": "Anti-Hydrogen Gravity Experiments at CERN",
        "text": (
            "The ALPHA experiment at CERN's ANTIMUON facility first measured the "
            "gravitational behaviour of antihydrogen in 2023, finding that antimatter "
            "falls downward (not upward) under gravity, with g_antiH / g = 0.75 ± 0.13(stat) ± 0.16(sys). "
            "This rules out strong gravitational repulsion for antimatter, though "
            "weak CPT-violating antigravity effects at the 10% level cannot yet be "
            "excluded. Future precision measurements with ALPHA-g aim to determine "
            "whether matter–antimatter gravitational asymmetry exists."
        ),
    },
]


# ═══════════════════════════════════════════════════════════════════════════════
# 2. VECTOR STORE  –  FAISS Index
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class VectorStore:
    """FAISS-backed dense vector store for document retrieval."""

    index: object = field(default=None, repr=False)
    documents: List[Dict] = field(default_factory=list)
    embeddings: np.ndarray = field(default=None, repr=False)
    dim: int = 0

    def build(self, documents: List[Dict], embedding_fn) -> None:
        import faiss

        self.documents = documents
        texts = [doc["text"] for doc in documents]

        print(f"[VectorStore] Encoding {len(texts)} documents …")
        vecs = embedding_fn(texts)
        self.embeddings = np.array(vecs, dtype=np.float32)
        self.dim = self.embeddings.shape[1]

        # L2-normalise for cosine similarity via inner product
        faiss.normalize_L2(self.embeddings)

        self.index = faiss.IndexFlatIP(self.dim)   # Inner Product ≡ cosine after normalisation
        self.index.add(self.embeddings)
        print(f"[VectorStore] Index built — {self.index.ntotal} vectors, dim={self.dim}")

    def search(self, query_vec: np.ndarray, top_k: int = 3) -> List[Tuple[Dict, float]]:
        import faiss

        q = np.array([query_vec], dtype=np.float32)
        faiss.normalize_L2(q)
        scores, indices = self.index.search(q, top_k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx != -1:
                results.append((self.documents[idx], float(score)))
        return results


# ═══════════════════════════════════════════════════════════════════════════════
# 3. EMBEDDING MODEL  –  sentence-transformers
# ═══════════════════════════════════════════════════════════════════════════════

class EmbeddingModel:
    """Wraps a SentenceTransformer for dense encoding."""

    MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"   # 80 MB, fast & accurate

    def __init__(self):
        from sentence_transformers import SentenceTransformer
        print(f"[EmbeddingModel] Loading {self.MODEL_NAME} …")
        self.model = SentenceTransformer(self.MODEL_NAME)
        print("[EmbeddingModel] Ready.")

    def encode(self, texts: List[str]) -> np.ndarray:
        return self.model.encode(texts, show_progress_bar=False, normalize_embeddings=False)

    def __call__(self, texts: List[str]) -> np.ndarray:
        return self.encode(texts)


# ═══════════════════════════════════════════════════════════════════════════════
# 4. GENERATION MODEL  –  HuggingFace LLM
# ═══════════════════════════════════════════════════════════════════════════════

class GenerationModel:
    """
    Wraps a HuggingFace causal-LM for answer synthesis.
    Default: google/flan-t5-base (instruction-tuned, runs on CPU).
    Swap MODEL_NAME for larger models if GPU is available.
    """

    MODEL_NAME = "google/flan-t5-small"   # Very lightweight, instruction-tuned, CPU-friendly
    # Alternatives:
    #   "google/flan-t5-base"                 - ~250M params, better quality (may cause OOM)
    #   "mistralai/Mistral-7B-Instruct-v0.2"  – needs 16 GB GPU
    #   "meta-llama/Meta-Llama-3-8B-Instruct" – needs HF token + 16 GB GPU
    #   "microsoft/phi-2"                      – 2.7 B params, decent on CPU

    def __init__(self):
        from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline

        print(f"[GenerationModel] Loading {self.MODEL_NAME} …")
        tokenizer = AutoTokenizer.from_pretrained(self.MODEL_NAME)
        model = AutoModelForSeq2SeqLM.from_pretrained(self.MODEL_NAME)

        self.pipe = pipeline(
            "text2text-generation",
            model=model,
            tokenizer=tokenizer,
            max_new_tokens=300,
            temperature=0.2,
            do_sample=False,
        )
        print("[GenerationModel] Ready.")

    def generate(self, prompt: str) -> str:
        output = self.pipe(prompt)
        return output[0]["generated_text"].strip()


# ═══════════════════════════════════════════════════════════════════════════════
# 5. PROMPT ENGINEERING  –  Antigravity-Optimised Template
# ═══════════════════════════════════════════════════════════════════════════════

SYSTEM_CONTEXT = """You are an expert physicist specialising in advanced propulsion,
spacetime engineering, and theoretical antigravity research.
Your answers are precise, scientifically grounded, and clearly distinguish between
experimentally confirmed phenomena, theoretical proposals, and speculative concepts."""


def build_rag_prompt(query: str, retrieved_chunks: List[Tuple[Dict, float]]) -> str:
    """
    Construct an optimised RAG prompt for antigravity queries.

    Prompt Strategy
    ───────────────
    • Role anchoring      – establishes expert persona to reduce hallucination.
    • Context injection   – retrieved passages ranked by relevance score.
    • Source labelling    – model is told which document each passage comes from.
    • Chain-of-thought    – instructs step-by-step reasoning before final answer.
    • Hedge calibration   – requires explicit uncertainty qualification.
    • Format spec         – structured output for downstream parsing.
    """

    context_block = ""
    for rank, (doc, score) in enumerate(retrieved_chunks, start=1):
        context_block += (
            f"[SOURCE {rank} | Title: {doc['title']} | Relevance: {score:.3f}]\n"
            f"{doc['text']}\n\n"
        )

    prompt = f"""{SYSTEM_CONTEXT}

══ RETRIEVED CONTEXT ══
{context_block.strip()}
══ END CONTEXT ══

QUESTION: {query}

INSTRUCTIONS:
1. Reason step-by-step using ONLY the retrieved context above.
2. Clearly state which source(s) support each claim.
3. Distinguish: CONFIRMED (experimentally verified) | THEORETICAL (mathematically sound) | SPECULATIVE (unverified hypothesis).
4. If the context is insufficient to answer fully, state what is missing.
5. Keep the answer concise but complete (≤ 200 words).

ANSWER:"""

    return prompt


# ═══════════════════════════════════════════════════════════════════════════════
# 6. RAG PIPELINE  –  Orchestrator
# ═══════════════════════════════════════════════════════════════════════════════

class AntigravityRAG:
    """End-to-end RAG pipeline: embed → retrieve → augment → generate."""

    def __init__(self, top_k: int = 3):
        self.top_k = top_k
        self.embedder = EmbeddingModel()
        self.generator = GenerationModel()
        self.store = VectorStore()

        # Index the corpus
        self.store.build(ANTIGRAVITY_CORPUS, self.embedder)

    def query(self, question: str, verbose: bool = True) -> Dict:
        """
        Run the full RAG pipeline for a user question.

        Returns
        ───────
        dict with keys: question, retrieved_docs, prompt, answer
        """

        # 1. Embed the query
        q_vec = self.embedder.encode([question])[0]

        # 2. Retrieve top-k relevant chunks
        retrieved = self.store.search(q_vec, top_k=self.top_k)

        if verbose:
            print(f"\n{'═'*60}")
            print(f"QUERY: {question}")
            print(f"{'─'*60}")
            print("TOP RETRIEVED DOCUMENTS:")
            for i, (doc, score) in enumerate(retrieved, 1):
                print(f"  {i}. [{score:.3f}] {doc['title']}")

        # 3. Build optimised prompt
        prompt = build_rag_prompt(question, retrieved)

        # 4. Generate answer
        if verbose:
            print(f"{'─'*60}")
            print("GENERATING ANSWER …")

        answer = self.generator.generate(prompt)

        if verbose:
            print(f"\nANSWER:\n{answer}")
            print(f"{'═'*60}\n")

        return {
            "question": question,
            "retrieved_docs": [{"title": d["title"], "score": s} for d, s in retrieved],
            "prompt": prompt,
            "answer": answer,
        }


# ═══════════════════════════════════════════════════════════════════════════════
# 7. DEMO  –  Antigravity Query Suite
# ═══════════════════════════════════════════════════════════════════════════════

DEMO_QUERIES = [
    "What is the relationship between dark energy and antigravity?",
    "Can rotating superconductors reduce gravitational pull?",
    "How does the Alcubierre drive achieve effective faster-than-light travel?",
    "Does antimatter fall up or down under gravity?",
    "What role does negative mass play in exotic propulsion concepts?",
]


def run_demo():
    print("\n" + "█"*60)
    print("  ANTIGRAVITY RAG SYSTEM  –  HuggingFace + FAISS")
    print("█"*60 + "\n")

    rag = AntigravityRAG(top_k=3)

    for q in DEMO_QUERIES:
        result = rag.query(q, verbose=True)


# ═══════════════════════════════════════════════════════════════════════════════
# 8. INTERACTIVE MODE
# ═══════════════════════════════════════════════════════════════════════════════

def interactive_mode():
    """REPL for free-form antigravity questions."""
    rag = AntigravityRAG(top_k=3)
    print("\nAntigravity RAG ready. Type 'quit' to exit.\n")

    while True:
        question = input("Ask a question: ").strip()
        if question.lower() in ("quit", "exit", "q"):
            print("Goodbye.")
            break
        if question:
            rag.query(question, verbose=True)


# ═══════════════════════════════════════════════════════════════════════════════
# ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "--interactive":
        interactive_mode()
    else:
        run_demo()