import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log("GEMINI_API_KEY loaded:", apiKey ? "Yes" : "No");

const listUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;

(async () => {
  try {
    console.log("Fetching available models from Gemini API...");
    const res = await fetch(listUrl);
    const data = await res.json();

    if (data.error) {
      console.error("Error fetching models:", data.error.message);
      console.log("Full response:", data);
      return;
    }

    const model =
      data.models?.find((m) =>
        m.name.includes("gemini")
      )?.name || "gemini-pro";

    console.log(`Using model: ${model}`);

    const genUrl = `https://generativelanguage.googleapis.com/v1/${model}:generateContent?key=${apiKey}`;
    const body = {
      contents: [
        {
          parts: [
            { text: "Summarize this: Pavana is testing Gemini API connection successfully." },
          ],
        },
      ],
    };

    console.log("Sending test generation request...");
    const genRes = await fetch(genUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const genData = await genRes.json();

    if (genData.error) {
      console.error("Generation error:", genData.error.message);
      console.log("Full response:", genData);
    } else {
      console.log("Gemini Response:", genData.candidates[0].content.parts[0].text);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
})();
