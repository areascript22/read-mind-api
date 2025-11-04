// src/services/translateService.js
import { v2 as Translate } from "@google-cloud/translate";

// Inicializa el cliente de traducción
const translator = new Translate.Translate();

export async function translateTextService(text, target = "es") {
  console.log("Calling translate service");
  if (!text) throw new Error("No text provided for translation");

  const [translation] = await translator.translate(text, target);
  return translation;
}
