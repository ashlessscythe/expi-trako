import * as React from "react";
import { APP_NAME } from "@/lib/config";

interface FeedbackReviewedEmailProps {
  name: string;
  adminName: string;
  siteName: string;
  feedbackMessage: string;
}

export const FeedbackReviewedEmail: React.FC<
  Readonly<FeedbackReviewedEmailProps>
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
        Your Feedback Has Been Reviewed! ✅
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
        Great news! {adminName} has reviewed your feedback for {siteName} and marked it as <strong>reviewed</strong>.
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
        Thank you for helping us improve {APP_NAME}. Your input is valuable to our team!
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
        🎯 <strong>Status:</strong> Reviewed - Your feedback has been processed by our team.
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