import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // ✅ ADD THIS
import path from "path";
import { startImapConnections } from "./services/imapService";
import { checkElasticsearchConnection } from "./config/elasticsearch";
import { createEmailIndex } from "./services/emailIndexService";
import emailRoutes from "./routes/emailRoutes";
import summaryRoutes from "./routes/summaryRoutes";
import classifyEmailsRoute from "./routes/classifyEmails";
import suggestReplyRoute from "./routes/aiReplyRoutes";

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log("OPENAI_API_KEY loaded:", !!process.env.OPENAI_API_KEY);

console.log("Environment variables loaded successfully!");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/emails", emailRoutes);

app.get("/", (req, res) => {
  res.send("ReachInbox Backend is Running with Elasticsearch + AI + IMAP!");
});

app.use("/api/summary", summaryRoutes);

app.use("/api/classify", classifyEmailsRoute);

app.use("/api/suggest-reply", suggestReplyRoute);

app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);

  try {
    console.log("Checking Elasticsearch connection...");
    await checkElasticsearchConnection();
    console.log("Elasticsearch connection OK");

    console.log("Creating index if not exists...");
    await createEmailIndex();
    console.log("Index created / verified");

    console.log("Starting IMAP connection...");
    await startImapConnections();
    console.log("IMAP connections started successfully!");
  } catch (error: any) {
    console.error("Startup error:", error.message || error);
  }
});
