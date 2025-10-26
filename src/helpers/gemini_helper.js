import { GoogleGenAI } from "@google/genai"; 

const ai = new GoogleGenAI({});

export async function generateText(prompt, model="gemini-2.5-flash"){
    const response = await ai.models.generateContent({
        model,
        contents:prompt,
    });

    return response.text;
}