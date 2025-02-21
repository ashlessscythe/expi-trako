import { Resend } from "resend";
import { APP_NAME, EMAIL_AT } from "./config";
import { ReactElement } from "react";

// Rate limiting - 1 email per second
let lastEmailSentAt = 0;
const EMAIL_RATE_LIMIT_MS = 1000;

async function waitForRateLimit() {
  const now = Date.now();
  const timeSinceLastEmail = now - lastEmailSentAt;
  
  if (timeSinceLastEmail < EMAIL_RATE_LIMIT_MS) {
    await new Promise(resolve => 
      setTimeout(resolve, EMAIL_RATE_LIMIT_MS - timeSinceLastEmail)
    );
  }
  lastEmailSentAt = Date.now();
}

// Initialize Resend only if API key is present
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface SendEmailParams {
  to: string[];
  subject: string;
  react: ReactElement;
  from?: string;
}

export async function sendEmail({ to, subject, react, from }: SendEmailParams) {
  const defaultFrom = `${APP_NAME} <no-reply@${EMAIL_AT}>`;

  // If Resend is not initialized, log the email instead of sending
  if (!resend) {
    // Log minimal information in development mode
    console.log("[Mock Email] Sending email in development mode");
    console.log("Subject:", subject);
    console.log("Recipients:", to.length);
    return { data: { id: "mock-email-id" }, error: null };
  }

  // Send real email using Resend with rate limiting
  try {
    await waitForRateLimit();
    const result = await resend.emails.send({
      from: from || defaultFrom,
      to, // Resend supports multiple recipients
      subject,
      react,
    });
    return { data: result.data, error: null };
  } catch (error) {
    console.error("Failed to send email. Check server logs for details.");
    return { data: null, error };
  }
}
