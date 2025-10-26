import { GoogleGenAI } from "@google/genai";
import { generateText } from "../helpers/gemini_helper.js";
import { PrismaClient } from "@prisma/client";
const ai = new GoogleGenAI({});
const prisma = new PrismaClient();

export const generateParagrapth = async (req, res) => {
  try {
    const { topic, environment } = req.body;
    if (environment == "dev") {
      return res.status(200).json({
        ok: true,
        paragraph:
          "English is essential in universities because it's the global language of academia. Much of the world's most significant research, scholarly journals, and textbooks are published in English, making proficiency in the language a key to accessing a vast body of knowledge.",
      });
    }
    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }
    const paragraph = await generateText(
      `Write a short, informative paragraph about: ${topic}`
    );
    res.status(200).json({ ok: true, paragraph: paragraph });
  } catch (e) {
    console.error("Error generating paragraph 1:", e);
    res
      .status(500)
      .json({ ok: false, message: "Failed to generate paragraph" });
  }
};

export const evaluateParaphrase = async (req, res) => {
  try {
    const { activityId, userParaphrase } = req.body;

    if (!activityId || !userParaphrase?.trim()) {
      return res.status(400).json({ ok: false, message: "Missing data" });
    }

    const activity = await prisma.aIReading.findUnique({
      where: { id: parseInt(activityId) },
    });
    console.log("Activity fetched for evaluation:", activity);

    if (!activity) {
      return res.status(404).json({ ok: false, message: "Activity not found" });
    }

    const prompt = `
You are an English writing evaluator.
Compare the following two texts:

Original: "${activity.content}"
Paraphrase: "${userParaphrase}"

Evaluate how accurate the paraphrase is in terms of meaning preservation, fluency, and originality.
Respond ONLY with raw JSON (no explanations, no markdown, no code fences).
Use exactly this format:
{
  "similarity_score": number 0-100,
  "fluency_score": number 0-100,
  "originality_score": number 0-100,
  "feedback": "Short constructive feedback (2-3 sentences)."
}
`;

    const analysis = await generateText(prompt);
    console.log(`Result of the analysis (raw): ${analysis}`);

    let cleaned = analysis
      .trim()
      .replace(/```json|```/g, "")
      .trim();

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch (err) {
      console.error("⚠️ JSON parse error:", err, "Raw text:", cleaned);

      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          result = JSON.parse(match[0]);
        } catch (err2) {
          return res.status(500).json({
            ok: false,
            message: "Failed to parse AI response",
            raw: cleaned,
          });
        }
      } else {
        return res.status(500).json({
          ok: false,
          message: "Invalid AI response format",
          raw: cleaned,
        });
      }
    }

    res.status(200).json({
      ok: true,
      result,
    });
  } catch (error) {
    console.error("Error evaluating paraphrase:", error);
    res
      .status(500)
      .json({ ok: false, message: "Failed to evaluate paraphrase" });
  }
};
