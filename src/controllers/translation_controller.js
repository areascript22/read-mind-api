import { PrismaClient } from "@prisma/client";
import { translateTextService } from "../helpers/translate_helper.js";
import { normalizeText } from "../helpers/text_helper.js";
const prisma = new PrismaClient();

export const translateText = async (req, res) => {
  try {
    const userId = req.id;
    const { text, target = "es" } = req.body;

    console.log("Texto a traducir:", text, "Idioma destino:", target);

    if (!text) {
      return res
        .status(400)
        .json({ message: "Debes enviar el texto a traducir." });
    }

    const normalized = normalizeText(text);

    // 1️⃣ Check if translation already exists
    let existingTranslation = await prisma.translation.findFirst({
      where: {
        sourceTextNormalized: normalized,
        targetLang: target,
      },
    });

    if (existingTranslation) {
      console.log("✅ Traducción encontrada en caché.");

      // Increment usage count
      await prisma.translation.update({
        where: { id: existingTranslation.id },
        data: { timesUsed: { increment: 1 } },
      });

      // Save relationship in UserTranslation
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
        translation: existingTranslation, // return all fields of Translation
      });
    }

    // 2️⃣ If not found, translate with Google API
    const translatedText = await translateTextService(text, target);

    // 3️⃣ Create new translation and userTranslation entry
    const newTranslation = await prisma.$transaction(async (tx) => {
      const createdTranslation = await tx.translation.create({
        data: {
          sourceText: text,
          sourceTextNormalized: normalized,
          translated: translatedText,
          sourceLang: "en",
          targetLang: target,
          timesUsed: 1,
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

    console.log("🆕 Nueva traducción creada.");

    // 4️⃣ Return all fields
    return res.json({
      success: true,
      cached: false,
      translation: newTranslation, // return all model fields
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
