import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();
console.log(`Current gemini key: ${process.env.GEMINI_API_KEY}`);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
export default genAI;
