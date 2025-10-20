import express from "express";
import { getAllEmails } from "../services/emailIndexService";

const router = express.Router();


router.get("/", async (req, res) => {
  try {
    // Fetch emails using reusable service
    const emails = await getAllEmails();

    if (!emails || emails.length === 0) {
      return res.status(200).json([]); 
    }

    res.status(200).json(emails);
  } catch (err: any) {
    console.error("Error fetching emails:", err.message);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
});

export default router;
