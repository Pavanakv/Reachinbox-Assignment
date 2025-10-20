# 📬 ReachInbox AI — Smart Email Assistant

> **AI-Powered Smart Inbox** that automatically **summarizes, classifies, and replies to emails** using Google Gemini + Vector Database (RAG).  
> Built with ❤️ using **Node.js, Express, TypeScript, React, TailwindCSS, and Framer Motion**.

---

## 🌟 Overview

ReachInbox AI is an intelligent email management system that reads incoming emails via IMAP, classifies them (Interested, Spam, Not Interested, etc.), and provides **AI-generated summaries and smart replies**.

It integrates:
- 🧠 **Gemini AI (Google Generative AI)** for NLP and response generation  
- 💾 **Vector Database (ChromaDB)** for context retrieval using **RAG (Retrieval Augmented Generation)**  
- 📩 **IMAP + Elasticsearch** for fetching and indexing real emails  
- ⚡ **Modern Frontend (React + TailwindCSS)** for a stunning, interactive dashboard  

---

## 🎯 Project Features

✅ **AI Email Classification** — Automatically categorizes emails as “Interested”, “Spam”, “Meeting Booked”, etc.  
✅ **AI-Powered Summaries** — Reads full emails and generates concise summaries.  
✅ **AI-Suggested Replies** — Creates intelligent responses using contextual RAG-powered Gemini AI.  
✅ **Vector Storage (ChromaDB)** — Stores email + contextual embeddings for smarter replies.  
✅ **IMAP Integration** — Connects directly with Gmail to fetch live emails.  
✅ **Modern Glassmorphism UI** — React + TailwindCSS + Framer Motion for a stunning experience.  
✅ **Dark/Light Mode** — Beautiful theme transitions.  
✅ **Copy & Regenerate** — Easily copy AI replies or request a new one instantly.  

---

## 🧩 Tech Stack

### 🔹 **Frontend**
- React + TypeScript  
- Tailwind CSS  
- Framer Motion (for animations)
- Lucide React (for icons)

### 🔹 **Backend**
- Node.js + Express + TypeScript  
- Google Generative AI (Gemini API)  
- ChromaDB (Vector Database)  
- Elasticsearch (Email indexing)  
- IMAPFlow (Email fetching)  

---

## 🧠 System Architecture

            ┌──────────────────┐
            │    Gmail (IMAP)  │
            └───────┬──────────┘
                    │
                    ▼
            ┌──────────────────┐
            │   Backend (Node) │
            │  - Express API   │
            │  - Gemini AI     │
            │  - ChromaDB (RAG)│
            │  - IMAP/Elastic  │
            └───────┬──────────┘
                    │
                    ▼
            ┌──────────────────┐
            │  Frontend (React)│
            │  - Smart Inbox   │
            │  - AI Summaries  │
            │  - Reply Modal   │
            └──────────────────┘

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Pavanakv/Reachinbox-Assignment.git
2️⃣ Install Dependencies
Backend
cd Reachinbox-backend
npm install

Frontend
cd ../Reachinbox-frontend
npm install

3️⃣ Setup Environment Variables

Create a .env file inside Reachinbox-backend/ with:

PORT=3000
GEMINI_API_KEY=your_google_generative_ai_key
IMAP_EMAIL=pavanakv0911@gmail.com
IMAP_PASSWORD=your_app_specific_password
ELASTIC_URL=http://localhost:9200
CHROMADB_PATH=./data/vectorstore


⚠️ Important: Use an App Password for Gmail IMAP (not your main Gmail password).
You can create one at: https://myaccount.google.com/apppasswords

4️⃣ Run the Backend
cd Reachinbox-backend
npx ts-node src/index.ts


✅ It should print:

🟢 Server running at http://localhost:3000
✅ Connected to Gmail
✅ Vector DB initialized

5️⃣ Run the Frontend
cd Reachinbox-frontend
npm run dev


Now open 👉 http://localhost:5173

You’ll see your AI Smart Inbox dashboard ✨

🧠 Example AI Flow
Email Received	AI Summary	AI Suggested Reply
“Hi, your resume is shortlisted for interview.”	“Your profile was shortlisted; they are asking for interview availability.”	“Thank you for shortlisting my profile! I’m available for the interview. You can book a slot here: https://cal.com/example”
📂 Folder Structure
ReachInbox-AI/
├── Reachinbox-backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── summary.ts
│   │   │   ├── suggestReply.ts
│   │   ├── services/
│   │   │   ├── vectorDB.ts
│   │   │   ├── summaryService.ts
│   │   │   ├── aiReplyService.ts
│   │   └── index.ts
│   ├── package.json
│   └── .env
│
└── Reachinbox-frontend/
    ├── src/
    │   ├── App.tsx
    │   ├── services/
    │   │   └── emailService.ts
    ├── package.json
    └── tailwind.config.js

🚀 Future Enhancements

📅 Auto-schedule interview meetings with Google Calendar API

🔔 Real-time email updates with WebSockets

🧑‍💼 Multi-account inbox support

🧠 Fine-tuned Gemini prompt templates for better responses

📊 Dashboard Analytics (AI accuracy, response time, etc.)

🧑‍💻 Author

👩‍💻 Pavana K.V
🎓 Information Science Engineering Student (VTU)
💡 Passionate about AI, Machine Learning & Full Stack Development
