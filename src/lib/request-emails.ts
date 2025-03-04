import { sendEmail } from "@/lib/email";
import {
  getPlantNotificationEmails,
  getLevelsForCost,
  getLevelName,
} from "@/lib/notification-lists";
import { RequestCreatedEmail } from "@/components/request-created-email";
import { RequestCompletedEmail } from "@/components/request-completed-email";
import { createElement } from "react";
import prisma from "@/lib/prisma";
import { ApprovalLevel } from "@prisma/client";

type RequestDetails = {
  id: string;
  shipmentNumber: string;
  plant?: string | null;
  authorizationNumber: string;
  siteId?: string | null;
  palletCount: number;
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

// Define local approval level interface for internal use
interface ApprovalLevelInfo {
  name: string;
  minAmount: number;
  maxAmount: number | null;
  emails: string[];
}

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

// Send level-based cost approval notifications after pallet count is set
export const sendCostApprovalNotifications = async (
  request: RequestDetails
) => {
  console.log("Starting sendCostApprovalNotifications");

  try {
    // Get system settings to check if cost calculation is enabled
    const settingsData = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: ["enableCostCalculation", "costPerPallet"],
        },
      },
    });

    const enableCostCalculation =
      settingsData.find((s) => s.key === "enableCostCalculation")?.value ===
      "true";
    const costPerPallet = Number(
      settingsData.find((s) => s.key === "costPerPallet")?.value || "0"
    );

    // If cost calculation is not enabled or cost per pallet is 0, skip sending notifications
    if (!enableCostCalculation || costPerPallet <= 0) {
      console.log(
        "Cost calculation is disabled or cost per pallet is 0, skipping approval notifications"
      );
      return;
    }

    // Calculate total cost
    const totalCost = request.palletCount * costPerPallet;
    console.log(
      `Total cost for request ${request.id}: $${totalCost.toFixed(2)}`
    );

    if (!request.plant || !request.siteId) {
      console.log("Missing plant or siteId, skipping approval notifications");
      return;
    }

    // Get the approval levels based on the total cost
    const requiredLevels = getLevelsForCost(totalCost);

    if (requiredLevels.length === 0) {
      console.log(
        "No approval levels match the total cost, skipping notifications"
      );
      return;
    }

    // Get notification emails from the plant notification list for the required levels
    const notificationEmails = await getPlantNotificationEmails(
      request.siteId,
      request.plant,
      requiredLevels
    );

    if (notificationEmails.length === 0) {
      console.log("No notification emails found for the required levels");
      return;
    }

    // Get the names of the levels that should receive notifications
    const levelNames = requiredLevels.map(getLevelName);
    const levelNamesString = levelNames.join(", ");

    const emailProps = {
      shipmentNumber: request.shipmentNumber,
      plant: request.plant,
      authorizationNumber: request.authorizationNumber,
      palletCount: request.palletCount,
      totalCost: totalCost.toFixed(2),
      approvalLevels: levelNamesString,
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

    console.log("Sending cost approval notification email");
    console.log("Email props:", emailProps);
    console.log("Sending to emails:", notificationEmails);

    await sendEmail({
      to: notificationEmails,
      subject: `Notification of estimated request cost: (${levelNamesString}) - ${request.shipmentNumber} - $${totalCost.toFixed(2)}`,
      react: createElement(RequestCreatedEmail as any, emailProps),
    });

    console.log("Cost approval notification email sent successfully");
  } catch (error) {
    console.error("Error sending cost approval notification:", error);
    // Don't throw the error, just log it to prevent disrupting the main flow
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
