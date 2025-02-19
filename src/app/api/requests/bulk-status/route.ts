import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import prisma from "@/lib/prisma";
import { RequestStatus } from "@prisma/client";
import { sendEmail as sendEmailUtil } from "@/lib/email";
import { RequestCompletedEmail } from "@/components/request-completed-email";
import { APP_NAME } from "@/lib/config";
import * as React from "react";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { requestIds, status, sendEmail = false } = await request.json();
    if (!requestIds || !Array.isArray(requestIds) || !status) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    // Update all requests in a transaction
    // Check if email notifications are enabled when updating to COMPLETED
    let shouldSendEmail = false;
    if (status === RequestStatus.COMPLETED && sendEmail) {
      const emailSetting = await prisma.systemSetting.findUnique({
        where: { key: "sendCompletionEmails" },
        select: { value: true },
      });
      shouldSendEmail = emailSetting?.value === "true";
    }

    // Update status and create logs in a transaction
    await prisma.$transaction(async (tx) => {
      // Update each request's status
      await tx.mustGoRequest.updateMany({
        where: {
          id: {
            in: requestIds,
          },
        },
        data: {
          status: status as RequestStatus,
        },
      });

      // Create log entries for each request
      const logs = requestIds.map((requestId) => ({
        mustGoRequestId: requestId,
        action: `Status updated to ${status} (Bulk Update)`,
        performedBy: session.user.id,
      }));

      await tx.requestLog.createMany({
        data: logs,
      });
    });

    // Send emails outside of transaction if needed
    if (shouldSendEmail) {
      const requests = await prisma.mustGoRequest.findMany({
        where: {
          id: {
            in: requestIds,
          },
        },
        include: {
          creator: {
            select: {
              name: true,
              email: true,
            },
          },
          trailers: {
            include: {
              trailer: true,
            },
          },
          partDetails: true,
        },
      });

      // Send email for each request with delay between sends
      for (let i = 0; i < requests.length; i++) {
        const request = requests[i];
        if (request.creator?.email) {
          // Add delay between sends (1 second)
          if (i > 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          const emailData = {
            trailers: request.trailers.map((t) => ({
              trailerNumber: t.trailer.trailerNumber,
              status: t.status,
            })),
            parts: request.partDetails.map((p) => ({
              partNumber: p.partNumber,
              status: p.status,
            })),
          };

          try {
            await sendEmailUtil({
              to: [request.creator.email],
              subject: `${APP_NAME} - Request #${request.shipmentNumber} Completed`,
              react: React.createElement(RequestCompletedEmail, {
                firstName: request.creator.name?.split(" ")[0] || "User",
                shipmentNumber: request.shipmentNumber,
                requestDetails: emailData,
              }),
            });
          } catch (emailError) {
            console.error(
              `Failed to send completion email for request ${request.id}:`,
              emailError instanceof Error ? emailError.message : emailError,
              "\nEmail data:",
              {
                to: request.creator.email,
                name: request.creator.name,
                shipmentNumber: request.shipmentNumber,
                trailers: emailData.trailers,
                parts: emailData.parts,
              }
            );
            // Continue with other emails even if one fails
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update request statuses:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Server Error",
      { status: 500 }
    );
  }
}
