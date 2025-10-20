import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "models/gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/${MODEL}:generateContent`;

export async function categorizeEmail(subject: string, body: string) {
  if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY in .env");

  const prompt = `
You are an AI email assistant.
Classify this email into one of these categories exactly:
[Interested, Meeting Booked, Not Interested, Spam, Out of Office]

Subject: ${subject}
Body: ${body}

Respond with only one category name from the list above.
`;

  try {
    const res = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { timeout: 30_000 } 
    );

    const aiCategory =
      res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      ?? res.data?.candidates?.[0]?.output
      ?? "Other";

    console.log(`AI categorized email as: ${aiCategory}`);
    return aiCategory;
  } catch (err: any) {
    console.error("AI categorization failed:", err.response?.data ?? err.message);
    return "Other";
  }
}
