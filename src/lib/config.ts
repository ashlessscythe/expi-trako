// Constants for use in both server and client components
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "MG Trako";

// email from
export const EMAIL_AT = process.env.EMAIL_FROM_DOMAIN || "resend.dev";

// auth stuff
export const SESSION_TTL_HOURS = process.env.NEXT_SESSION_TTL_HRS || 24;
export const JWT_VERSION = process.env.NEXT_JWT_VERSION || 1;

// Client-side config
export const config = {
  appName: APP_NAME,
} as const;
