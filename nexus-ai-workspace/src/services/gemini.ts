import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateResponse = async (prompt: string, history: { role: string; content: string }[]) => {
  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are Nexus, a highly advanced AI assistant. Your responses should be concise, professional, and insightful. Use markdown for formatting.",
      },
    });

    // We don't use the history directly in sendMessage yet, but we could map it if needed.
    // For now, simple message sending.
    const response = await chat.sendMessage({ message: prompt });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
