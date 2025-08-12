import * as React from "react";
import { APP_NAME } from "@/lib/config";

interface FeedbackSubmittedEmailProps {
  name: string;
  siteName: string;
}

export const FeedbackSubmittedEmail: React.FC<
  Readonly<FeedbackSubmittedEmailProps>
> = ({ name, siteName }) => (
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
        Feedback Received! 📝
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
        Thank you for taking the time to submit feedback for {siteName}. We've received your message and our team will review it shortly.
      </p>
      <p
        style={{
          color: "#333333",
          fontSize: "16px",
          lineHeight: "1.5",
          margin: "0 0 20px",
        }}
      >
        You'll receive another email notification once your feedback has been reviewed by our team.
      </p>
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
        💡 <strong>Tip:</strong> Your feedback helps us improve {APP_NAME} for everyone. We appreciate your input!
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