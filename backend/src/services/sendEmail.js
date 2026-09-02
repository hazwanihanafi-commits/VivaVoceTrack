import fetch from "node-fetch";

const RESEND_API_KEY =
  process.env.RESEND_API_KEY;

const EMAIL_FROM =
  process.env.EMAIL_FROM ||
  "PKTAAB VivaTrack <no-reply@ppbms.my>";

const TEST_MODE =
  process.env.EMAIL_TEST_MODE === "true";

const TEST_EMAIL =
  process.env.TEST_EMAIL ||
  "hazwanihanafi@gmail.com";

const DEFAULT_CC = [
  "norhisham_puteh@usm.my",
  "anissyamimi@usm.my",
];

/**
 * ======================================================
 * GENERIC EMAIL SENDER
 * ======================================================
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
  /**
   * ----------------------------------------------------
   * Validate Resend API key
   * ----------------------------------------------------
   */

  if (!RESEND_API_KEY) {
    throw new Error(
      "Missing RESEND_API_KEY"
    );
  }

  /**
   * ----------------------------------------------------
   * Validate recipient
   * ----------------------------------------------------
   */

  if (!to) {
    throw new Error(
      "Recipient email is required."
    );
  }

  /**
   * ----------------------------------------------------
   * Prepare recipients
   * ----------------------------------------------------
   */

  const recipients =
    TEST_MODE
      ? [TEST_EMAIL]
      : Array.isArray(to)
      ? to
      : [to];

  /**
   * ----------------------------------------------------
   * Prepare payload
   * ----------------------------------------------------
   */

  const payload = {
    from: EMAIL_FROM,

    to: recipients,

    subject:
      subject || "VivaTrack Notification",

    text,

    html,
  };

  /**
   * ----------------------------------------------------
   * CC
   *
   * DEFAULT_CC is automatically included for
   * normal emails.
   *
   * TEST MODE intentionally has no CC.
   * ----------------------------------------------------
   */

  if (!TEST_MODE) {
    const additionalCC =
      cc
        ? Array.isArray(cc)
          ? cc
          : [cc]
        : [];

    payload.cc = [
      ...DEFAULT_CC,
      ...additionalCC.filter(
        (email) =>
          !DEFAULT_CC.includes(email)
      ),
    ];
  }

  /**
   * ----------------------------------------------------
   * BCC
   * ----------------------------------------------------
   */

  if (!TEST_MODE && bcc) {
    payload.bcc =
      Array.isArray(bcc)
        ? bcc
        : [bcc];
  }

  /**
   * ----------------------------------------------------
   * Reply-To
   * ----------------------------------------------------
   */

  if (replyTo) {
    payload.reply_to = replyTo;
  }

  /**
   * ----------------------------------------------------
   * Attachments
   * ----------------------------------------------------
   */

  if (
    Array.isArray(attachments) &&
    attachments.length > 0
  ) {
    payload.attachments =
      attachments;
  }

  /**
   * ----------------------------------------------------
   * LOG
   * ----------------------------------------------------
   */

  console.log(
    "=========================================="
  );

  console.log(
    "📧 VIVATRACK EMAIL"
  );

  console.log(
    "=========================================="
  );

  console.log(
    "From:",
    EMAIL_FROM
  );

  console.log(
    "To:",
    payload.to
  );

  console.log(
    "CC:",
    payload.cc || []
  );

  console.log(
    "BCC:",
    payload.bcc || []
  );

  console.log(
    "Subject:",
    payload.subject
  );

  console.log(
    "Test Mode:",
    TEST_MODE
  );

  console.log(
    "=========================================="
  );

  /**
   * ----------------------------------------------------
   * SEND THROUGH RESEND
   * ----------------------------------------------------
   */

  const response =
    await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${RESEND_API_KEY}`,

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            payload
          ),
      }
    );

  /**
   * ----------------------------------------------------
   * READ RESPONSE
   * ----------------------------------------------------
   */

  const result =
    await response.json();

  /**
   * ----------------------------------------------------
   * HANDLE ERROR
   * ----------------------------------------------------
   */

  if (!response.ok) {
    console.error(
      "❌ RESEND ERROR:",
      result
    );

    throw new Error(
      result?.message ||
      result?.error ||
      "Email sending failed."
    );
  }

  /**
   * ----------------------------------------------------
   * SUCCESS
   * ----------------------------------------------------
   */

  console.log(
    "✅ EMAIL SENT SUCCESSFULLY"
  );

  console.log(
    "Resend response:",
    result
  );

  console.log(
    "=========================================="
  );

  return result;
}
