import * as React from "react";
import { APP_NAME } from "@/lib/config";

interface RoleChangeEmailProps {
  firstName: string;
  newRole: string;
}

export const RoleChangeEmail: React.FC<Readonly<RoleChangeEmailProps>> = ({
  firstName,
  newRole,
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
        Account Approved! 🎉
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
        Great news, {firstName}! Your {APP_NAME} account has been approved.
        You've been assigned the role of{" "}
        {newRole.toLowerCase().replace(/_/g, " ")}.
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
          You can now access the platform with your new role privileges:
        </p>
        <ul
          style={{
            color: "#4a5568",
            margin: "0",
            paddingLeft: "20px",
            lineHeight: "1.6",
          }}
        >
          <li>Create and manage shipping requests</li>
          <li>Track requests in real-time</li>
          <li>Access detailed reporting and analytics</li>
          <li>Collaborate with your team members</li>
        </ul>
      </div>

      <div
        style={{
          backgroundColor: "#e8f5e9",
          borderRadius: "6px",
          padding: "15px",
          border: "1px solid #4caf50",
        }}
      >
        <p
          style={{
            color: "#1b5e20",
            margin: "0",
            fontSize: "14px",
            lineHeight: "1.5",
          }}
        >
          You can now log in to your account and start using the platform. If
          you have any questions about your role or permissions, please contact
          your administrator.
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
