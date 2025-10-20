export async function fetchEmails() {
  try {
    const res = await fetch("http://localhost:3000/api/emails");

    if (!res.ok) throw new Error("Failed to fetch emails");

    const data = await res.json();

    const formattedEmails = data.map((email: any) => ({
      id: email.id,
      subject: email.subject || "(No Subject)",
      from: email.from || email.accountId || "Unknown Sender",
      body: email.body || "",
      aiCategory: email.aiCategory || "Uncategorized",
      date: email.date || new Date().toISOString(),
    }));

    console.log("Loaded Emails from Backend:", formattedEmails);
    return formattedEmails;
  } catch (error) {
    console.error("Error fetching emails:", error);
    return [];
  }
}
