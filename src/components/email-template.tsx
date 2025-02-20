import * as React from "react";
import { APP_NAME } from "@/lib/config";

interface EmailTemplateProps {
  firstName: string;
  siteName: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
  siteName,
}) => (
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
        Welcome to {APP_NAME} at {siteName}, {firstName}! 🎉
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
        Thank you for signing up with {APP_NAME} at {siteName}. We're excited to
        have you on board! Your account is currently pending approval from our
        administrators. Once approved, you'll receive another notification and
        can start using the platform.
      </p>

      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "6px",
          padding: "20px",
          marginBottom: "20px",
          border: "1px solid #e1e1e1",
        }}
      >
        <h2
          style={{
            color: "#2c5282",
            fontSize: "18px",
            margin: "0 0 15px",
            fontWeight: "600",
          }}
        >
          What's Next?
        </h2>
        <p
          style={{
            color: "#4a5568",
            margin: "0 0 15px",
            lineHeight: "1.6",
          }}
        >
          Our administrators will review your account request shortly. Once
          approved, you'll be able to:
        </p>
        <ul
          style={{
            color: "#4a5568",
            margin: "0",
            paddingLeft: "20px",
            lineHeight: "1.6",
          }}
        >
          <li>Create and manage your shipping requests</li>
          <li>Track shipments in real-time</li>
          <li>Access detailed reporting and analytics</li>
          <li>Collaborate with your team members</li>
        </ul>
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
          Note: Account approval typically takes 1-2 business days. We'll notify
          you via email once your account has been activated.
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
        If you have any questions, our support team is here to help!
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
