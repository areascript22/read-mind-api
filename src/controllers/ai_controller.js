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
    const { paragraph, userParaphrase } = req.body;

    if (!paragraph || !userParaphrase?.trim()) {
      return res.status(400).json({ ok: false, message: "Missing data" });
    }

    const prompt = `
You are an English writing evaluator.
Compare the following two texts:

Original: "${paragraph}"
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

export const evaluateMainIdea = async (req, res) => {
  try {
    const { paragraph, userMainIdea } = req.body;

    if (!paragraph || !userMainIdea?.trim()) {
      return res.status(400).json({ ok: false, message: "Missing data" });
    }

    const prompt = `
You are an English reading evaluator.
Original paragraph: "${paragraph}"
User's main idea extraction: "${userMainIdea}"

Evaluate how well the user identified the main idea of the paragraph.
Respond ONLY with raw JSON (no explanations, no markdown, no code fences).
Use exactly this format:
{
  "accuracy_score": number 0-100,
  "clarity_score": number 0-100,
  "conciseness_score": number 0-100,
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

    res.status(200).json({ ok: true, result });
  } catch (error) {
    console.error("Error evaluating main idea:", error);
    res
      .status(500)
      .json({ ok: false, message: "Failed to evaluate main idea" });
  }
};

export const evaluateSummary = async (req, res) => {
  try {
    const { paragraph, userSummary } = req.body;

    if (!paragraph || !userSummary?.trim()) {
      return res.status(400).json({ ok: false, message: "Missing data" });
    }

    const prompt = `
You are an English reading evaluator.
Original paragraph: "${paragraph}"
User's summary: "${userSummary}"

Evaluate how well the user summarized the paragraph in terms of accuracy, coverage, and clarity.
Respond ONLY with raw JSON (no explanations, no markdown, no code fences).
Use exactly this format:
{
  "accuracy_score": number 0-100,
  "coverage_score": number 0-100,
  "clarity_score": number 0-100,
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

    res.status(200).json({ ok: true, result });
  } catch (error) {
    console.error("Error evaluating summary:", error);
    res.status(500).json({ ok: false, message: "Failed to evaluate summary" });
  }
};
