import * as React from "react";
import { APP_NAME } from "@/lib/config";

interface PasswordResetEmailProps {
  resetLink: string;
  name: string;
  siteName: string;
}

export const PasswordResetEmail: React.FC<
  Readonly<PasswordResetEmailProps>
> = ({ resetLink, name, siteName }) => (
  <div
    style={{
      backgroundColor: "#ffffff",
      fontFamily: "Arial, sans-serif",
      padding: "40px 20px",
      maxWidth: "600px",
      margin: "0 auto",
    }}
  >
    <div
      style={{
        textAlign: "center",
        marginBottom: "30px",
      }}
    >
      <h1
        style={{
          color: "#1a1a1a",
          fontSize: "24px",
          margin: "0 0 10px",
          fontWeight: "bold",
        }}
      >
        Password Reset Request
      </h1>
    </div>

    <div
      style={{
        backgroundColor: "#f7f7f7",
        borderRadius: "8px",
        padding: "30px",
        marginBottom: "30px",
      }}
    >
      <p
        style={{
          color: "#333333",
          fontSize: "16px",
          lineHeight: "1.5",
          margin: "0 0 20px",
        }}
      >
        Hello {name},
      </p>
      <p
        style={{
          color: "#333333",
          fontSize: "16px",
          lineHeight: "1.5",
          margin: "0 0 20px",
        }}
      >
        We received a request to reset your password for your {APP_NAME} account
        at {siteName}. To proceed with the password reset, please click the
        button below:
      </p>

      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <a
          href={resetLink}
          style={{
            backgroundColor: "#2c5282",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "6px",
            textDecoration: "none",
            display: "inline-block",
            fontWeight: "bold",
          }}
        >
          Reset Password
        </a>
      </div>

      <div
        style={{
          backgroundColor: "#fff8dc",
          borderRadius: "6px",
          padding: "15px",
          border: "1px solid #ffd700",
        }}
      >
        <p
          style={{
            color: "#8b4513",
            margin: "0",
            fontSize: "14px",
            lineHeight: "1.5",
          }}
        >
          This password reset link will expire in 1 hour for security reasons.
          If you didn't request this reset, please ignore this email.
        </p>
      </div>
    </div>

    <div
      style={{
        borderTop: "1px solid #e1e1e1",
        paddingTop: "20px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          color: "#666666",
          fontSize: "14px",
          margin: "0 0 10px",
        }}
      >
        If you have any questions, please contact our support team.
      </p>
      <p
        style={{
          color: "#888888",
          fontSize: "12px",
          margin: "0",
        }}
      >
        © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </p>
    </div>
  </div>
);
