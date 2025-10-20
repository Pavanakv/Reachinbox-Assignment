import express from "express";
import { generateEmailSummary } from "../services/summaryService";

const router = express.Router();

router.post("/", async (req, res) => {
  const { subject, body } = req.body;
  if (!subject && !body) {
    return res.status(400).json({ error: "Missing subject or body" });
  }

  const summary = await generateEmailSummary(subject, body);
  res.json({ summary });
});

export default router;
