import fetch from "node-fetch";

interface EmailNotification {
  subject: string;
  from: string;
  date: string;
  aiCategory: string;
  body?: string;
}

export async function sendNotifications(email: EmailNotification) {
  try {
    if (email.aiCategory !== "Interested") return;

    const slackUrl = process.env.SLACK_WEBHOOK_URL!;
    const webhookUrl = process.env.WEBHOOK_SITE_URL!;

    const message = {
      text: ` *New Interested Lead!*\n
*Subject:* ${email.subject}\n
*From:* ${email.from}\n
*Date:* ${email.date}\n
Category: *${email.aiCategory}*`,
    };

    // Send Slack Notification
    if (slackUrl) {
      const res = await fetch(slackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });
      if (res.ok) console.log("Slack notification sent!");
      else console.error("Slack webhook failed:", res.statusText);
    }

    // send Webhook to webhook.site
    if (webhookUrl) {
      const webhookPayload = {
        event: "InterestedLead",
        timestamp: new Date().toISOString(),
        emailData: email,
      };

      const res2 = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload),
      });

      if (res2.ok) console.log("Webhook triggered successfully!");
      else console.error("Webhook trigger failed:", res2.statusText);
    }
  } catch (err) {
    console.error("Error sending notifications:", err);
  }
}
