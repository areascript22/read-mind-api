import { PrismaClient } from "@prisma/client";
import { normalizeText } from "../helpers/text_helper.js";
import { generateText } from "../helpers/gemini_helper.js";
const prisma = new PrismaClient();

export const translateText = async (req, res) => {
  try {
    const userId = req.id;
    const { text, target = "es", readingId } = req.body;

    if (!text) {
      return res
        .status(400)
        .json({ message: "Debes enviar el texto a traducir." });
    }

    if (!readingId) {
      return res.status(400).json({
        message: "readingId es requerido para la traducción contextual.",
      });
    }

    const reading = await prisma.aIReading.findUnique({
      where: { id: readingId },
      select: { content: true },
    });

    if (!reading) {
      return res
        .status(404)
        .json({ message: "No se encontró el reading especificado." });
    }

    const contextParagraph = reading.content;
    const normalized = normalizeText(text);

    let existingTranslation = await prisma.translation.findFirst({
      where: {
        sourceTextNormalized: normalized,
        targetLang: target,
        readingId: readingId,
      },
    });

    if (existingTranslation) {
      await prisma.translation.update({
        where: { id: existingTranslation.id },
        data: { timesUsed: { increment: 1 } },
      });

      if (userId) {
        await prisma.userTranslation.upsert({
          where: {
            userId_translationId: {
              userId: Number(userId),
              translationId: existingTranslation.id,
            },
          },
          create: {
            userId: Number(userId),
            translationId: existingTranslation.id,
          },
          update: {},
        });
      }

      return res.json({
        success: true,
        cached: true,
        translation: existingTranslation,
      });
    }
    const prompt = `
You are a professional translator. Translate the target word/phrase based on the context provided.

PARAGRAPH CONTEXT:
"${contextParagraph}"

TARGET WORD/PHRASE TO TRANSLATE:
"${text}"

TARGET LANGUAGE: ${target}

Analyze the target word/phrase within the context of the paragraph and provide the most accurate translation in ${target} that fits the context.

Respond ONLY with raw JSON (no explanations, no markdown, no code fences).
Use exactly this format:
{
  "translatedText": "the translated text here",
  "explanation": "brief explanation of why this translation fits the context",
  "confidence": "high/medium/low"
}
`;
    const geminiResponse = await generateText(prompt);
    let cleaned = geminiResponse
      .trim()
      .replace(/```json|```/g, "")
      .trim();

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch (err) {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          result = JSON.parse(match[0]);
        } catch (err2) {
          result = {
            translatedText: text,
            explanation: "Translation failed - using fallback",
            confidence: "low",
          };
        }
      } else {
        result = {
          translatedText: text,
          explanation: "Translation failed - no valid JSON response",
          confidence: "low",
        };
      }
    }

    const translatedText = result.translatedText || text;

    const newTranslation = await prisma.$transaction(async (tx) => {
      const createdTranslation = await tx.translation.create({
        data: {
          sourceText: text,
          sourceTextNormalized: normalized,
          translated: translatedText,
          sourceLang: "en",
          targetLang: target,
          timesUsed: 1,
          readingId: readingId,
        },
      });

      if (userId) {
        await tx.userTranslation.create({
          data: {
            userId: Number(userId),
            translationId: createdTranslation.id,
          },
        });
      }

      return createdTranslation;
    });

    return res.json({
      success: true,
      cached: false,
      translation: newTranslation,
      contextUsed: true,
    });
  } catch (error) {
    console.error("❌ Error al traducir:", error);
    return res
      .status(500)
      .json({ message: "Error interno al traducir el texto." });
  }
};

export const getAllTranslations = async (req, res) => {
  try {
    const userId = req.id; // El ID del usuario autenticado
    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    // Obtener todas las traducciones del usuario con su relación a la tabla Translation
    const userTranslations = await prisma.userTranslation.findMany({
      where: { userId },
      include: {
        translation: {
          select: {
            id: true,
            sourceText: true,
            translated: true,
            sourceLang: true,
            targetLang: true,
            createdAt: true,
            timesUsed: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Formatear respuesta
    const translations = userTranslations.map((ut) => ({
      id: ut.translation.id,
      sourceText: ut.translation.sourceText,
      translated: ut.translation.translated,
      sourceLang: ut.translation.sourceLang,
      targetLang: ut.translation.targetLang,
      createdAt: ut.createdAt,
      timesUsed: ut.translation.timesUsed,
    }));

    res.json({
      success: true,
      count: translations.length,
      translations,
    });
  } catch (error) {
    console.error("Error al obtener las traducciones del usuario:", error);
    res
      .status(500)
      .json({ message: "Error interno al obtener las traducciones" });
  }
};
