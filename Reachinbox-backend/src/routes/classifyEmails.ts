import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fetch from "node-fetch";

dotenv.config();

const router = express.Router();

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

interface ClassifyRequestBody {
  subject: string;
  body: string;
}

const CATEGORIES = [
  "Interested",
  "Meeting Booked",
  "Not Interested",
  "Spam",
  "Out of Office",
];

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL!;
const WEBHOOK_SITE_URL = process.env.WEBHOOK_SITE_URL!;


router.post("/", async (req: Request, res: Response) => {
  try {
    const { subject, body } = req.body as ClassifyRequestBody;

    if (!subject && !body) {
      return res.status(400).json({ error: "Subject or body required" });
    }

    // Few-shot learning examples for Gemini
    const prompt = `
You are an expert email classifier. Categorize the following email into ONE of:
[Interested, Meeting Booked, Not Interested, Spam, Out of Office]

Examples:

1️⃣
Subject: "Let's schedule a demo next week"
Body: "Hi, we are interested in your product. Can we book a call?"
→ Label: Meeting Booked

2️⃣
Subject: "Not the right fit for us"
Body: "We appreciate your message, but we're not interested at the moment."
→ Label: Not Interested

3️⃣
Subject: "Exclusive discount – 70% off!"
Body: "Hurry up! Get our new product for 70% off before it’s gone."
→ Label: Spam

4️⃣
Subject: "Out of Office Auto-Reply"
Body: "I am currently out of office until next week."
→ Label: Out of Office

5️⃣
Subject: "Sounds great, we’d love to know more"
Body: "Yes, we are interested. Please share more details."
→ Label: Interested

Now classify the following email:
Subject: "${subject}"
Body: "${body}"

Respond ONLY with one of these categories:
Interested, Meeting Booked, Not Interested, Spam, Out of Office
`;


    const result = await model.generateContent(prompt);
    let label = result.response.text().trim();

    if (!CATEGORIES.includes(label)) {
      const match = CATEGORIES.find((cat) =>
        label.toLowerCase().includes(cat.toLowerCase())
      );
      label = match || "Interested"; 
    }

    console.log(`[AI Classifier] "${subject}" → ${label}`);

    if (label === "Interested") {
      await sendNotifications({
        subject,
        body,
        aiCategory: label,
        date: new Date().toISOString(),
        from: "unknown@lead.com",
      });
    }

    res.json({ category: label });
  } catch (err: any) {
    console.error("Error classifying email:", err);
    res.status(500).json({ error: "Classification failed" });
  }
});

export default router;


async function sendNotifications(email: {
  subject: string;
  body: string;
  aiCategory: string;
  date: string;
  from: string;
}) {
  try {
    const slackMsg = {
      text: `🚀 *New Interested Lead!*\n
*Subject:* ${email.subject}\n
*From:* ${email.from}\n
*Date:* ${email.date}\n
_Category:_ ${email.aiCategory}`,
    };

    // Slack Notification
    if (SLACK_WEBHOOK_URL) {
      const res1 = await fetch(SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slackMsg),
      });
      if (res1.ok) console.log("Slack notification sent!");
      else console.error("Slack webhook failed:", res1.statusText);
    }

    // Webhook Trigger (for automation)
    if (WEBHOOK_SITE_URL) {
      const webhookPayload = {
        event: "InterestedLead",
        timestamp: new Date().toISOString(),
        data: email,
      };

      const res2 = await fetch(WEBHOOK_SITE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload),
      });
      if (res2.ok) console.log("Webhook triggered successfully!");
      else console.error("Webhook trigger failed:", res2.statusText);
    }
  } catch (error) {
    console.error("Notification error:", error);
  }
}
