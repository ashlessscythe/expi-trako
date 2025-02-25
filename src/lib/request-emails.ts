import { sendEmail } from "@/lib/email";
import { getPlantNotificationEmails } from "@/lib/notification-lists";
import { RequestCreatedEmail } from "@/components/request-created-email";
import { RequestCompletedEmail } from "@/components/request-completed-email";
import { createElement } from "react";

type RequestDetails = {
  id: string;
  shipmentNumber: string;
  plant?: string | null;
  authorizationNumber: string;
  siteId?: string | null;
  creator: {
    name: string;
    email: string;
  };
  trailers: Array<{
    trailer: {
      trailerNumber: string;
    };
    status?: string;
  }>;
  partDetails: Array<{
    partNumber: string;
    quantity: number;
    status?: string;
  }>;
};

// Send notification to plant distribution list when request is created
export const sendCreationNotification = async (request: RequestDetails) => {
  console.log("Starting sendCreationNotification");
  console.log("Request:", {
    id: request.id,
    plant: request.plant,
    siteId: request.siteId,
  });

  if (!request.plant || !request.siteId) {
    console.log("Missing plant or siteId, skipping notification");
    return;
  }

  try {
    const notificationEmails = await getPlantNotificationEmails(
      request.siteId,
      request.plant
    );

    console.log("Notification emails:", notificationEmails);

    if (notificationEmails.length > 0) {
      console.log("Sending creation notification email");

      const emailProps = {
        shipmentNumber: request.shipmentNumber,
        plant: request.plant,
        authorizationNumber: request.authorizationNumber,
        requestDetails: {
          trailers: request.trailers.map((rt) => ({
            trailerNumber: rt.trailer.trailerNumber,
          })),
          parts: request.partDetails.map((pd) => ({
            partNumber: pd.partNumber,
            quantity: pd.quantity,
          })),
        },
        creator: {
          name: request.creator.name,
          email: request.creator.email,
        },
      };

      console.log("Email props:", emailProps);

      await sendEmail({
        to: notificationEmails,
        subject: `New Request Created - ${request.shipmentNumber}`,
        react: createElement(RequestCreatedEmail as any, emailProps),
      });

      console.log("Creation notification email sent successfully");
    } else {
      console.log("No notification emails found for this plant");
    }
  } catch (error) {
    console.error("Error sending creation notification:", error);
    throw error;
  }
};

// Send completion notification to request creator
export const sendCompletionNotification = async (request: RequestDetails) => {
  console.log("Starting sendCompletionNotification");

  try {
    console.log("Sending completion notification to:", request.creator.email);

    const emailProps = {
      firstName: request.creator.name.split(" ")[0],
      shipmentNumber: request.shipmentNumber,
      requestDetails: {
        trailers: request.trailers.map((rt) => ({
          trailerNumber: rt.trailer.trailerNumber,
          status: rt.status || "Completed",
        })),
        parts: request.partDetails.map((pd) => ({
          partNumber: pd.partNumber,
          status: pd.status || "Completed",
        })),
      },
    };

    console.log("Email props:", emailProps);

    await sendEmail({
      to: [request.creator.email],
      subject: `Request Completed - ${request.shipmentNumber}`,
      react: createElement(RequestCompletedEmail as any, emailProps),
    });

    console.log("Completion notification email sent successfully");
  } catch (error) {
    console.error("Error sending completion notification:", error);
    throw error;
  }
};
