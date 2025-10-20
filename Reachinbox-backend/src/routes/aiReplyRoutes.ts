import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRelevantContext } from "../services/vectorDB";

dotenv.config();
const router = express.Router();

process.env.GOOGLE_API_BASE_URL = "https://generativelanguage.googleapis.com/v1";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

router.post("/", async (req: Request, res: Response) => {
  try {
    const { subject, body } = req.body;
    console.log(`Generating AI reply for: ${subject}`);

    const context = await getRelevantContext(`${subject} ${body}`);
    console.log(" Retrieved context:", context);

    const prompt = `
You are an AI email assistant. Based on this email and context, generate a short, polite, and professional human-like reply.

Context:
${context}

Email:
Subject: ${subject}
Body: ${body}

Write only the reply text. Do not include greetings like "Dear" or signatures.
`;

    const result = await model.generateContent(prompt);
    const reply = result?.response?.text()?.trim();

    if (!reply) {
      console.warn("No reply text received from Gemini.");
      return res.json({ reply: "AI could not generate a response. Try again." });
    }

    console.log(" AI Reply Generated:", reply);
    res.json({ reply });
  } catch (err) {
    console.error(" Error generating suggested reply:", err);
    res.status(500).json({ reply: "Error generating AI reply." });
  }
});

export default router;
