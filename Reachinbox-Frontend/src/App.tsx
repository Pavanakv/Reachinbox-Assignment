import { useEffect, useState } from "react";
import { fetchEmails } from "./services/emailService";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon,
  Inbox,
  Mail,
  Star,
  Trash2,
  Power,
  Sparkles,
  Copy,
  RefreshCw,
  X,
} from "lucide-react";
import clsx from "clsx";

//  Email interface
interface Email {
  id: string;
  subject: string;
  from: string;
  aiCategory: string;
  body?: string;
  date: string;
}

export default function App() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOutput, setSelectedOutput] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiMode, setAiMode] = useState<"summary" | "reply" | null>(null);

  //  Load emails
  useEffect(() => {
    const loadEmails = async () => {
      try {
        const data = await fetchEmails();
        setEmails(data);
        setFilteredEmails(data);
      } catch (err) {
        console.error(" Error loading emails:", err);
      } finally {
        setLoading(false);
      }
    };
    loadEmails();
    const interval = setInterval(loadEmails, 15000);
    return () => clearInterval(interval);
  }, []);

  // Filter + search
  useEffect(() => {
    let updated = [...emails];
    if (filter !== "All") updated = updated.filter((e) => e.aiCategory === filter);
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      updated = updated.filter(
        (e) =>
          e.subject.toLowerCase().includes(term) ||
          e.from.toLowerCase().includes(term)
      );
    }
    setFilteredEmails(updated);
  }, [filter, searchTerm, emails]);

  //  Toast helper
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  //  Theme toggle
  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  //  Generate AI Summary or Reply
  const handleAIAction = async (email: Email, type: "summary" | "reply") => {
    setIsGenerating(true);
    setSelectedEmail(email);
    setAiMode(type);

    const endpoint =
      type === "summary"
        ? "http://localhost:3000/api/summary"
        : "http://localhost:3000/api/suggest-reply";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: email.subject,
          body: email.body || "",
        }),
      });
      const data = await res.json();

      const output =
        type === "summary"
          ? data.summary || "AI could not summarize this email."
          : data.reply || "AI could not generate a reply.";

      setSelectedOutput(
        type === "summary"
          ? `🧠 Smart Summary:\n\n${output}`
          : `💬 Suggested Reply:\n\n${output}`
      );

      showToast(type === "summary" ? "✨ Summary ready!" : "💬 Reply generated!");
    } catch (err) {
      console.error("❌ Error generating AI output:", err);
      showToast("⚠️ Failed to generate output.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (selectedOutput) {
      navigator.clipboard.writeText(selectedOutput);
      showToast("📋 Copied to clipboard!");
    }
  };

  // Loading screen
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full mb-5"
        />
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-lg font-medium tracking-wide"
        >
          Syncing your Smart Inbox...
        </motion.p>
      </div>
    );

  return (
    <div
      className={clsx(
        "flex min-h-screen transition-all duration-700 font-inter",
        darkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100"
          : "bg-gradient-to-br from-blue-50 via-white to-gray-100 text-gray-900"
      )}
    >
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={clsx(
          "w-64 p-6 flex flex-col justify-between shadow-2xl border-r border-gray-300/20 dark:border-gray-800/40 backdrop-blur-2xl",
          darkMode
            ? "bg-gradient-to-b from-gray-900/60 to-gray-800/30"
            : "bg-gradient-to-b from-white/60 to-blue-50/20"
        )}
      >
        <div>
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-2 mb-10">
            <Sparkles /> Smart Inbox
          </h1>
          <nav className="space-y-3">
            {[
              { name: "All", icon: Inbox },
              { name: "Meeting Booked", icon: Star },
              { name: "Interested", icon: Mail },
              { name: "Not Interested", icon: Trash2 },
              { name: "Spam", icon: Power },
            ].map(({ name, icon: Icon }) => (
              <button
                key={name}
                onClick={() => setFilter(name)}
                className={clsx(
                  "flex items-center gap-3 w-full px-4 py-2 rounded-xl text-left transition-all",
                  filter === name
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                    : "hover:bg-gray-200/40 dark:hover:bg-gray-700/40"
                )}
              >
                <Icon size={18} />
                <span>{name}</span>
              </button>
            ))}
          </nav>
        </div>

        <button
          onClick={toggleTheme}
          className="flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 transition-all duration-300"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </motion.aside>

      {/* Main */}
      <main className="flex-1 p-10 relative">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            ✉️ Inbox —{" "}
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-blue-500"
            >
              {filteredEmails.length}
            </motion.span>{" "}
            mails
          </h2>
          <input
            type="text"
            placeholder="🔍 Search emails..."
            className="px-4 py-2 rounded-xl w-72 border shadow-sm focus:ring-2 outline-none transition-all duration-300 focus:ring-blue-400 dark:focus:ring-purple-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEmails.map((email) => (
            <motion.div
              key={email.id}
              whileHover={{ scale: 1.04, y: -3 }}
              transition={{ type: "spring", stiffness: 150, damping: 15 }}
              className={clsx(
                "rounded-2xl p-5 border shadow-xl backdrop-blur-md transition-all duration-500 group hover:shadow-2xl",
                darkMode
                  ? "bg-gradient-to-br from-gray-800/70 to-gray-900/60 border-gray-700/60"
                  : "bg-gradient-to-br from-white/80 to-blue-50/60 border-gray-100/70"
              )}
            >
              <h3 className="font-bold text-lg mb-1">{email.subject}</h3>
              <p className="text-sm text-gray-500 mb-3">From: {email.from}</p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleAIAction(email, "summary")}
                  className="text-blue-600 text-sm font-semibold hover:text-blue-800"
                >
                  View AI Summary →
                </button>
                <button
                  onClick={() => handleAIAction(email, "reply")}
                  className="text-green-600 text-sm font-semibold hover:text-green-800"
                >
                  💬 Generate Reply
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {selectedOutput && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
            onClick={() => setSelectedOutput(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className={clsx(
                "rounded-2xl shadow-2xl p-8 max-w-lg w-[90%] relative border",
                darkMode
                  ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black text-gray-100 border-gray-700"
                  : "bg-gradient-to-br from-white via-gray-50 to-blue-50 text-gray-800 border-gray-200"
              )}
            >
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                ✨ Gemini AI Output
              </h3>

              <motion.p
                className="whitespace-pre-line leading-relaxed text-sm"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ repeat: isGenerating ? Infinity : 0, duration: 2 }}
              >
                {isGenerating ? "🤖 Thinking..." : selectedOutput}
              </motion.p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 flex items-center gap-2"
                >
                  <Copy size={16} /> Copy
                </button>
                <button
                  onClick={() => handleAIAction(selectedEmail!, aiMode!)}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2"
                >
                  <RefreshCw size={16} /> Regenerate
                </button>
                <button
                  onClick={() => setSelectedOutput(null)}
                  className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-800 flex items-center gap-2"
                >
                  <X size={16} /> Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-xl text-sm backdrop-blur-md"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
