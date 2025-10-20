import express from "express";
import { generateEmailSummary } from "../services/summaryService.js";

const router = express.Router();

router.post("/summary", async (req, res) => {
  try {
    console.log("Incoming summary request body:", req.body); 
    const { subject, body } = req.body;

    if (!subject && !body) {
      return res.status(400).json({ error: "Missing email data" });
    }

    console.log("Received summary request for:", subject);

    const summary = await generateEmailSummary(subject, body);

    console.log("AI Summary:", summary);

    res.json({ summary });
  } catch (error: any) {
    console.error("Error generating summary:", error.message || error);
    res.status(500).json({ summary: "Failed to generate summary." });
  }
});

export default router;
