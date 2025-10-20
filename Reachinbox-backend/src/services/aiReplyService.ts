import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRelevantContext } from "./vectorDB";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function generateSuggestedReply(emailBody: string) {
  const context = await getRelevantContext(emailBody);

  const prompt = `
You are an AI email assistant that writes polite, concise replies.
Use this context from company knowledge base:
${context}

Now write a reply for this email:
"${emailBody}"

Rules:
- Be polite and concise (under 80 words)
- If it's an interview scheduling mail, include the meeting link if relevant
- Respond professionally in a human tone
`;

  const response = await model.generateContent(prompt);
  const reply = response.response.text().trim();

  console.log("AI Suggested Reply:", reply);
  return reply;
}
