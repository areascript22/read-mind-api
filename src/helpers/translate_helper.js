import { v2 as Translate } from "@google-cloud/translate";

const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  : null;

const translator = credentials
  ? new Translate.Translate({
      credentials,
      projectId: credentials.project_id,
    })
  : new Translate.Translate(); 

export async function translateTextService(text, target = "es") {
  if (!text) throw new Error("No text provided for translation");
  const [translation] = await translator.translate(text, target);
  return translation;
} 
