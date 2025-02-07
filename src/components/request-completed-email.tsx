import * as React from "react";
import { APP_NAME } from "@/lib/config";

interface RequestCompletedEmailProps {
  firstName: string;
  shipmentNumber: string;
  requestDetails: {
    trailers: Array<{
      trailerNumber: string;
      status: string;
    }>;
    parts?: Array<{
      partNumber: string;
      status: string;
    }>;
  };
}

export const RequestCompletedEmail: React.FC<
  Readonly<RequestCompletedEmailProps>
> = ({ firstName, shipmentNumber, requestDetails }) => (
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
        Shipment #{shipmentNumber} Completed ✅
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
        Hi {firstName},
      </p>

      <p
        style={{
          color: "#333333",
          fontSize: "16px",
          lineHeight: "1.5",
          margin: "0 0 20px",
        }}
      >
        Your request has been completed. Here's a summary of the items:
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
          Request Summary
        </h2>

        {requestDetails.trailers.length > 0 && (
          <>
            <h3
              style={{
                color: "#4a5568",
                fontSize: "16px",
                margin: "0 0 10px",
                fontWeight: "600",
              }}
            >
              Trailers
            </h3>
            <ul
              style={{
                color: "#4a5568",
                margin: "0 0 15px",
                paddingLeft: "20px",
                lineHeight: "1.6",
              }}
            >
              {requestDetails.trailers.map((trailer) => (
                <li key={trailer.trailerNumber}>
                  Trailer #{trailer.trailerNumber} - {trailer.status}
                </li>
              ))}
            </ul>
          </>
        )}

        {requestDetails.parts && requestDetails.parts.length > 0 && (
          <>
            <h3
              style={{
                color: "#4a5568",
                fontSize: "16px",
                margin: "0 0 10px",
                fontWeight: "600",
              }}
            >
              Parts
            </h3>
            <ul
              style={{
                color: "#4a5568",
                margin: "0",
                paddingLeft: "20px",
                lineHeight: "1.6",
              }}
            >
              {requestDetails.parts.map((part) => (
                <li key={part.partNumber}>
                  Part #{part.partNumber} - {part.status}
                </li>
              ))}
            </ul>
          </>
        )}
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
        Thank you for using {APP_NAME}!
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
