import * as React from "react";
import { APP_NAME } from "@/lib/config";

interface RequestCreatedEmailProps {
  shipmentNumber: string;
  plant: string;
  authorizationNumber: string;
  requestDetails: {
    trailers: Array<{
      trailerNumber: string;
    }>;
    parts?: Array<{
      partNumber: string;
      quantity: number;
    }>;
  };
  creator: {
    name: string;
    email: string;
  };
  palletCount?: number;
  totalCost?: string;
  approvalLevels?: string;
}

export const RequestCreatedEmail: React.FC<
  Readonly<RequestCreatedEmailProps>
> = ({
  shipmentNumber,
  plant,
  authorizationNumber,
  requestDetails,
  creator,
  palletCount,
  totalCost,
  approvalLevels,
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
        New Request Created 🚛
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
          Request Details
        </h2>

        <table
          style={{
            width: "100%",
            marginBottom: "20px",
            borderCollapse: "collapse",
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  padding: "8px 0",
                  color: "#666",
                  width: "40%",
                }}
              >
                Shipment Number:
              </td>
              <td
                style={{
                  padding: "8px 0",
                  color: "#333",
                  fontWeight: "500",
                }}
              >
                {shipmentNumber}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: "8px 0",
                  color: "#666",
                }}
              >
                Plant:
              </td>
              <td
                style={{
                  padding: "8px 0",
                  color: "#333",
                  fontWeight: "500",
                }}
              >
                {plant}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: "8px 0",
                  color: "#666",
                }}
              >
                Authorization Number:
              </td>
              <td
                style={{
                  padding: "8px 0",
                  color: "#333",
                  fontWeight: "500",
                }}
              >
                {authorizationNumber}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: "8px 0",
                  color: "#666",
                }}
              >
                Created By:
              </td>
              <td
                style={{
                  padding: "8px 0",
                  color: "#333",
                  fontWeight: "500",
                }}
              >
                {creator.name} ({creator.email})
              </td>
            </tr>
          </tbody>
        </table>

        {(palletCount !== undefined || totalCost || approvalLevels) && (
          <div
            style={{
              marginTop: "15px",
              padding: "15px",
              backgroundColor: "#fdf6e3",
              borderRadius: "6px",
              border: "1px solid #fbd38d",
            }}
          >
            <h3
              style={{
                color: "#B7791F",
                fontSize: "16px",
                margin: "0 0 10px",
                fontWeight: "600",
              }}
            >
              Cost Details
            </h3>
            <ul
              style={{
                margin: 0,
                paddingLeft: "20px",
                color: "#744210",
                lineHeight: "1.6",
              }}
            >
              {palletCount !== undefined && (
                <li>Pallet Count: {palletCount}</li>
              )}
              {totalCost && <li>Estimated Cost: ${totalCost}</li>}
              {approvalLevels && <li>Approval Levels: {approvalLevels}</li>}
            </ul>
          </div>
        )}

        {requestDetails.trailers.length > 0 && (
          <>
            <h3
              style={{
                color: "#4a5568",
                fontSize: "16px",
                margin: "15px 0 10px",
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
                  Trailer #{trailer.trailerNumber}
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
                margin: "15px 0 10px",
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
                  Part #{part.partNumber} - Quantity: {part.quantity}
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
        This is an automated notification from {APP_NAME}.
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
