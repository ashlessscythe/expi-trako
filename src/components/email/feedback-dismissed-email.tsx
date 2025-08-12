import * as React from "react";
import { APP_NAME } from "@/lib/config";

interface FeedbackDismissedEmailProps {
  name: string;
  adminName: string;
  siteName: string;
  feedbackMessage: string;
}

export const FeedbackDismissedEmail: React.FC<
  Readonly<FeedbackDismissedEmailProps>
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
        Feedback Update 📋
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
        Thank you for taking the time to share your feedback with us. {adminName} has carefully reviewed your input for {siteName} and wanted to provide you with an update.
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
        After thorough consideration, we've determined that this particular feedback item doesn't align with our current development priorities or technical constraints. However, please know that every piece of feedback we receive is valuable and helps inform our understanding of user needs and preferences.
      </p>

      <p
        style={{
          color: "#333333",
          fontSize: "16px",
          lineHeight: "1.5",
          margin: "0 0 20px",
        }}
      >
        We encourage you to continue sharing your thoughts with us. Your perspective is important, and future feedback may align better with our roadmap and capabilities. We're committed to building the best possible experience for our users.
      </p>
    </div>

    <div
      style={{
        backgroundColor: "#fff3e0",
        borderRadius: "6px",
        padding: "15px",
        border: "1px solid #ff9800",
      }}
    >
      <p
        style={{
          color: "#e65100",
          margin: "0",
          fontSize: "14px",
          lineHeight: "1.5",
        }}
      >
        📝 <strong>Status: Dismissed</strong> - Your feedback has been reviewed and considered, but won't be implemented at this time.
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
        We appreciate your understanding and continued engagement with {APP_NAME}.
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