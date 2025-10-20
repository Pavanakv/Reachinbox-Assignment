import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "models/gemini-2.5-flash"; 
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export async function generateEmailSummary(subject: string, body: string): Promise<string> {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY in .env");
    }

    const prompt = `
You are an AI assistant that summarizes emails clearly and concisely.
Summarize the following email in 2-3 sentences:
Subject: ${subject}
Body: ${body}
`;

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("Gemini API Error:", data.error);
      return "Failed to generate summary.";
    }

    const summary =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "No summary available.";

    console.log("Gemini Summary Generated:", summary);
    return summary;
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Error generating summary.";
  }
}
