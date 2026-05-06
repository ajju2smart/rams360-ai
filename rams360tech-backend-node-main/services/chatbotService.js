import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are RAMS360 AI Assistant — an expert in Reliability, Availability, Maintainability, and Safety (RAMS) engineering.

You assist engineers using the RAMS360 platform. You have deep knowledge of:
- Failure Rate Prediction (MIL-HDBK-217, NPRD methods)
- MTTR (Mean Time To Repair) calculation and analysis
- FMECA (Failure Mode, Effects and Criticality Analysis)
- PM MRA (Preventive Maintenance, Maintenance Resource Analysis)
- Spare Parts Analysis
- Safety analysis (hazard identification, risk assessment)
- Product Breakdown Structure (PBS)
- Reliability Block Diagrams (RBD)
- Fault Tree Analysis (FTA)
- IEC 60300, MIL-STD-470, MIL-HDBK-472 standards

Answer questions clearly and precisely. Stay focused on RAMS engineering topics.
If a question is outside your domain, politely redirect the user to relevant RAMS concepts.
Keep answers concise, technical, and actionable.`;

let genAI = null;

function getClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Send a message to Gemini and get a RAMS-domain response.
 * @param {string} userMessage
 * @param {Array<{role: string, parts: Array<{text: string}>}>} history - prior turns
 * @returns {Promise<string>}
 */
export async function askChatbot(userMessage, history = []) {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  const chat = model.startChat({
    history,
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.1,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH",       threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ],
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}
