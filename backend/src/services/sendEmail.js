import fetch from "node-fetch";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Reuse your verified Resend domain
const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  "PKTAAB VivaTrack <no-reply@ppbms.my>";

const TEST_MODE = process.env.EMAIL_TEST_MODE === "true";
const TEST_EMAIL = process.env.TEST_EMAIL || "hazwanihanafi@gmail.com";

/**
 * Generic email sender
 */
export default async function sendEmail({
  to,
  cc,
  bcc,
  subject,
  text = "",
  html = "",
  replyTo,
  attachments = [],
}) {
  if (!RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY");
  }

  const payload = {
    from: EMAIL_FROM,

    to: TEST_MODE
      ? [TEST_EMAIL]
      : Array.isArray(to)
      ? to
      : [to],

    subject,

    text,

    html,
  };

  if (!TEST_MODE && cc) {
    payload.cc = Array.isArray(cc) ? cc : [cc];
  }

  if (!TEST_MODE && bcc) {
    payload.bcc = Array.isArray(bcc) ? bcc : [bcc];
  }

  if (replyTo) {
    payload.reply_to = replyTo;
  }

  if (attachments.length > 0) {
    payload.attachments = attachments;
  }

  console.log("================================");
  console.log("📧 VivaTrack Email");
  console.log("================================");
  console.log("To :", payload.to);
  console.log("CC :", payload.cc);
  console.log("Subject :", subject);
  console.log("Test Mode :", TEST_MODE);
  console.log("================================");

  const response = await fetch(
    "https://api.resend.com/emails",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    console.error(result);
    throw new Error(result.message || "Email sending failed.");
  }

  console.log("✅ Email Sent");
  console.log(result);

  return result;
}
