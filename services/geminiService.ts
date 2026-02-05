
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Strictly follow initialization rules (named parameter, direct process.env usage)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getNoorInspiration = async (name: string, day: number, fastedToday: boolean) => {
  try {
    // Fix: Use ai.models.generateContent directly with the recommended model
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are Noor, a friendly, glowing Ramadan lantern mascot for kids. 
      The child's name is ${name}. Today is Day ${day} of Ramadan.
      ${fastedToday ? "They completed a fast today!" : "They are doing their best today."}
      Give a short, 2-sentence encouraging message that is playful, kind, and mentions one beautiful thing about Ramadan (like sharing, patience, or the moon). 
      Use kid-friendly language and emojis.`,
      config: {
        temperature: 1,
        topP: 0.95,
      }
    });
    // Fix: Access .text as a property, not a method
    return response.text || "You're doing amazing! Keep shining like a little star! 🌟";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Keep up the great work! You are a Ramadan superstar! ✨";
  }
};

export const getDailyGoodDeed = async (age: number) => {
  try {
    // Fix: Using responseSchema for structured data extraction
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest 3 very simple, specific good deeds for a ${age}-year-old child to do during Ramadan. 
      Keep them practical and helpful. Format as a JSON list.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              deed: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["deed", "description"]
          }
        }
      }
    });
    // Fix: Direct property access for text and safe parsing
    const jsonStr = (response.text || "[]").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Error:", error);
    return [
      { deed: "Help set the table", description: "Place the dates and water for Iftar." },
      { deed: "Smile at everyone", description: "Smiling is a form of charity!" },
      { deed: "Share a toy", description: "Share something you love with a sibling or friend." }
    ];
  }
};
