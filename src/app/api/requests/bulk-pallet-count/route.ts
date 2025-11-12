import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { isCustomerService, isAdmin, isWarehouse } from "@/lib/auth";
import type { SessionUser, AuthUser } from "@/lib/types";
import { sendCostApprovalNotifications } from "@/lib/request-emails";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as SessionUser;

    // Block PENDING users from updating pallet counts
    if (user.role === "PENDING") {
      return NextResponse.json(
        { error: "Your account is pending approval" },
        { status: 403 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    const authUser: AuthUser = {
      id: dbUser.id,
      role: dbUser.role,
    };

    if (
      !isCustomerService(authUser) &&
      !isAdmin(authUser) &&
      !isWarehouse(authUser)
    ) {
      return NextResponse.json(
        { error: "Only customer service and warehouse can update requests" },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { palletCounts } = data;

    if (!palletCounts || typeof palletCounts !== "object") {
      return NextResponse.json(
        { error: "Invalid pallet counts data" },
        { status: 400 }
      );
    }

    try {
      // Use a transaction to ensure all updates succeed or none do
      // First update all pallet counts in a transaction
      await prisma.$transaction(async (tx) => {
        // Update each request's pallet count using request IDs
        await Promise.all(
          Object.entries(palletCounts).map(async ([requestId, palletCount]) => {
            await tx.mustGoRequest.update({
              where: { id: requestId },
              data: {
                palletCount: palletCount as number,
                logs: {
                  create: {
                    action: `Updated pallet count to ${palletCount}`,
                    performedBy: user.id,
                  },
                },
              },
            });
          })
        );
      });

      // After transaction completes, fetch the updated requests and send emails
      try {
        // Process each request for email notifications
        await Promise.all(
          Object.keys(palletCounts).map(async (requestId) => {
            // Get the full request details for notification
            const requestWithDetails = await prisma.mustGoRequest.findUnique({
              where: { id: requestId },
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

            if (requestWithDetails && requestWithDetails.palletCount > 0) {
              // Send cost approval notification with level-based notifications
              await sendCostApprovalNotifications(requestWithDetails);
            }
          })
        );
      } catch (emailError) {
        console.error("Error sending cost approval notifications:", emailError);
        // Don't fail the request if email sending fails
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  } catch (error) {
    console.error("Failed to update pallet counts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
