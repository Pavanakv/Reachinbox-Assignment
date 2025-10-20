// src/services/imapService.ts
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { categorizeEmail } from "./aiCategorizer";
import { indexEmail } from "./emailIndexService";
import { sendNotifications } from "./notificationService";
import dotenv from "dotenv";

dotenv.config();

interface AccountConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  secure: boolean;
}

/**
 * Start IMAP connections for all configured accounts
 */
export async function startImapConnections() {
  const accounts: AccountConfig[] = [];

  // Account 1
  if (process.env.EMAIL_USER_1 && process.env.EMAIL_PASS_1) {
    accounts.push({
      user: process.env.EMAIL_USER_1,
      password: process.env.EMAIL_PASS_1,
      host: "imap.gmail.com",
      port: 993,
      secure: true,
    });
  }

  // Optional second account
  if (process.env.EMAIL_USER_2 && process.env.EMAIL_PASS_2) {
    accounts.push({
      user: process.env.EMAIL_USER_2,
      password: process.env.EMAIL_PASS_2,
      host: "imap.gmail.com",
      port: 993,
      secure: true,
    });
  }

  if (accounts.length === 0) {
    console.warn("No IMAP accounts configured in .env file!");
    return;
  }

  for (const account of accounts) {
    await startImapConnection(account);
  }
}

/**
 * Connects to one IMAP account and processes emails
 */
async function startImapConnection(account: AccountConfig) {
  console.log(`🔌 Connecting to IMAP for ${account.user}...`);

  const client = new ImapFlow({
    host: account.host,
    port: account.port,
    secure: account.secure,
    auth: {
      user: account.user,
      pass: account.password,
    },
  });

  try {
    await client.connect();
    console.log(`Connected to ${account.user}`);

    await client.mailboxOpen("INBOX");

    // Fetch last 30 days of emails
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - 30);
    const messages = await client.search({ since: sinceDate });

    if (!Array.isArray(messages) || messages.length === 0) {
      console.log(`📭 No recent emails found for ${account.user}`);
    } else {
      for (const seq of messages) {
        const message = (await client.fetchOne(seq, { source: true })) as any;
        if (!message?.source) continue;

        const parsed = await simpleParser(message.source);
        const aiCategory = await categorizeEmail(parsed.subject || "", parsed.text || "");

        const emailData = {
          subject: parsed.subject || "(No Subject)",
          body: parsed.text || "",
          from: parsed.from?.text || "Unknown",
          to: parsed.to?.text || "Unknown",
          date: parsed.date || new Date(),
          aiCategory,
          accountId: account.user,
          folder: "INBOX",
        };

        await indexEmail(emailData);
        console.log(`[${account.user}] ${emailData.subject} → ${aiCategory}`);

        // Send Slack + Webhook notifications for "Interested"
        if (aiCategory.toLowerCase() === "interested") {
          await sendNotifications({
            subject: emailData.subject,
            body: emailData.body,
            from: emailData.from,
            aiCategory,
            date: emailData.date.toString(),
          });
        }
      }
    }

    // Real-time new email detection (IMAP IDLE)
    client.on("exists", async () => {
      console.log(`New email detected for ${account.user}`);
      try {
        const latest = (await client.fetchOne("*", { source: true })) as any;
        if (!latest?.source) return;

        const parsed = await simpleParser(latest.source);
        const aiCategory = await categorizeEmail(parsed.subject || "", parsed.text || "");

        const emailData = {
          subject: parsed.subject || "(No Subject)",
          body: parsed.text || "",
          from: parsed.from?.text || "Unknown",
          to: parsed.to?.text || "Unknown",
          date: parsed.date || new Date(),
          aiCategory,
          accountId: account.user,
          folder: "INBOX",
        };

        await indexEmail(emailData);
        console.log(`[${account.user}] ${emailData.subject} → ${aiCategory}`);

        
      } catch (err) {
        console.error("Error processing new email:", err);
      }
    });
  } catch (error) {
    console.error(`IMAP error for ${account.user}:`, error);
  }
}
