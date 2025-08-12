import * as React from "react";
import { APP_NAME } from "@/lib/config";

interface FeedbackResolvedEmailProps {
  name: string;
  adminName: string;
  siteName: string;
  feedbackMessage: string;
}

export const FeedbackResolvedEmail: React.FC<
  Readonly<FeedbackResolvedEmailProps>
> = ({ name, adminName, siteName, feedbackMessage }) => (
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
        Your Feedback Has Been Resolved! 🎉
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
        We're excited to let you know that {adminName} has resolved your feedback for {siteName}! Your input has been carefully considered and addressed by our team.
      </p>
      
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "6px",
          padding: "20px",
          border: "1px solid #e1e1e1",
          marginBottom: "20px",
        }}
      >
        <p
          style={{
            color: "#666666",
            fontSize: "14px",
            margin: "0 0 10px",
            fontWeight: "bold",
          }}
        >
          Your Feedback:
        </p>
        <p
          style={{
            color: "#333333",
            fontSize: "14px",
            lineHeight: "1.5",
            margin: "0",
            fontStyle: "italic",
          }}
        >
          "{feedbackMessage}"
        </p>
      </div>

      <p
        style={{
          color: "#333333",
          fontSize: "16px",
          lineHeight: "1.5",
          margin: "0 0 20px",
        }}
      >
        We truly appreciate you taking the time to share your thoughts with us. Your feedback helps us create a better experience for everyone using {APP_NAME}. We're committed to continuous improvement, and insights like yours are invaluable to that process.
      </p>
    </div>

    <div
      style={{
        backgroundColor: "#e8f5e8",
        borderRadius: "6px",
        padding: "15px",
        border: "1px solid #4caf50",
      }}
    >
      <p
        style={{
          color: "#2e7d32",
          margin: "0",
          fontSize: "14px",
          lineHeight: "1.5",
        }}
      >
        ✨ <strong>Status: Resolved</strong> - Your feedback has been fully addressed and implemented by our team.
      </p>
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
        Thank you for being part of our community and helping us grow!
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