// src/services/vectorDB.ts
import { ChromaClient } from "chromadb";
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();


console.log("Starting Vector DB initialization...");

// Initialize Gemini Embedding Model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

// Connect to ChromaDB
console.log("Connecting to ChromaDB...");
const client = new ChromaClient();

export async function initializeVectorDB() {
  try {
    const dataPath = path.join(__dirname, "../data/context.json");
    console.log("Loading context data from:", dataPath);

    if (!fs.existsSync(dataPath)) {
      console.error("ERROR: context.json not found!");
      return;
    }

    const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    console.log(`Loaded ${data.length} context entries.`);


    const collection = await client.getOrCreateCollection({
      name: "reply_context",
      embeddingFunction: undefined,
    });
    console.log("Collection ready:", collection.name);

    for (const item of data) {
      console.log(`🔹 Embedding: ${item.topic}`);
      const embeddingResponse = await model.embedContent(item.content);
      const embedding = embeddingResponse.embedding.values;

      await collection.add({
        ids: [item.topic],
        embeddings: [embedding],
        metadatas: [item],
      });
    }

    console.log("Vector DB initialized with context data!");
  } catch (err) {
    console.error("Error initializing Vector DB:", err);
  }
}


export async function getRelevantContext(query: string): Promise<string> {
  console.log("Retrieving relevant context for query:", query);

  try {
    const collection = await client.getOrCreateCollection({
      name: "reply_context",
      embeddingFunction: undefined, 
    });

    const embeddingResponse = await model.embedContent(query);
    const queryEmbedding = embeddingResponse.embedding.values;

    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: 2,
    });

    const bestContext =
      (results as any)?.metadatas?.[0]?.[0]?.content ||
      (results as any)?.documents?.[0]?.[0] ||
      "";

    console.log("Retrieved context:", bestContext);
    return bestContext;
  } catch (error) {
    console.error("Error fetching relevant context:", error);
    return "";
  }
} 

initializeVectorDB();
