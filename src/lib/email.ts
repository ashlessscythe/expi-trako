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
    console.log("MOCK EMAIL SERVICE (no RESEND_API_KEY set)");
    console.log("----------------------------------------");
    console.log("From:", from || defaultFrom);
    console.log("To:", to.join(", "));
    console.log("Subject:", subject);
    console.log("React Component:", "[Component rendered in mock mode]");
    console.log("----------------------------------------");
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
    console.error("Failed to send email:", error);
    return { data: null, error };
  }
}
