// Constants for use in both server and client components
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "MG Trako";

// email from
export const EMAIL_AT = process.env.EMAIL_FROM_DOMAIN || "resend.dev";

// Client-side config
export const config = {
  appName: APP_NAME,
} as const;
