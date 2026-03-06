import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: (import.meta as any).env.VITE_GEMINI_API_KEY || (process as any).env.GEMINI_API_KEY });

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
  // 1. Search backend for relevant chunks
  const searchRes = await fetch('/api/docs/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: question })
  });

  if (!searchRes.ok) {
    throw new Error('Failed to search knowledge base');
  }

  const { chunks } = await searchRes.json();

  if (!chunks || chunks.length === 0) {
    return {
      answer: "I could not find this in the provided documents. Can you share the relevant document?",
      sources: [],
      confidence: "low"
    };
  }

  // 2. Prepare context for Gemini
  const context = chunks.map((c: any, i: number) => `[Doc ${i+1}: ${c.source}]\n${c.content}`).join('\n\n');

  // 3. Call Gemini
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      You are a document assistant. You must answer the user question using ONLY the provided context.
      If the answer is not in the context, you MUST respond exactly with: "I could not find this in the provided documents. Can you share the relevant document?"
      
      Context:
      ${context}
      
      Question: ${question}
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          answer: { type: Type.STRING, description: "A short paragraph answering the question." },
          confidence: { type: Type.STRING, enum: ["high", "medium", "low"] },
          relevantSourceIndices: { 
            type: Type.ARRAY, 
            items: { type: Type.INTEGER },
            description: "Indices (starting from 1) of the documents used in the answer."
          }
        },
        required: ["answer", "confidence", "relevantSourceIndices"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{}');
    
    // Map indices back to sources
    const sources: Source[] = (data.relevantSourceIndices || []).map((idx: number) => {
      const chunk = chunks[idx - 1];
      if (!chunk) return null;
      return {
        document: chunk.source,
        snippet: chunk.content,
        score: chunk.score || 0
      };
    }).filter(Boolean);

    return {
      answer: data.answer,
      sources: sources,
      confidence: data.confidence as any
    };
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    return {
      answer: "I could not find this in the provided documents. Can you share the relevant document?",
      sources: [],
      confidence: "low"
    };
  }
}
