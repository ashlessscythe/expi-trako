import { Resend } from "resend";
import { APP_NAME, EMAIL_AT } from "./config";
import { ReactElement } from "react";

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

  // Send real email using Resend
  try {
    const result = await resend.emails.send({
      from: from || defaultFrom,
      to,
      subject,
      react,
    });
    return { data: result.data, error: null };
  } catch (error) {
    console.error("Failed to send email. Check server logs for details.");
    return { data: null, error };
  }
}
