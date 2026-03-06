export interface Source {
  document: string;
  snippet: string;
  score: number;
}

export interface KnowledgeResponse {
  answer: string;
  sources: Source[];
  confidence: "high" | "medium" | "low";
}

export async function askKnowledgeBase(question: string): Promise<KnowledgeResponse> {
  try {
    const res = await fetch('http://localhost:8000/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question, top_k: 3 })
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    return {
      answer: data.answer,
      sources: data.sources || [],
      confidence: data.confidence as ("high" | "medium" | "low")
    };
  } catch (error) {
    console.error("Knowledge base fetch error:", error);
    return {
      answer: "I could not find this in the provided documents. Can you share the relevant document?",
      sources: [],
      confidence: "low"
    };
  }
}
