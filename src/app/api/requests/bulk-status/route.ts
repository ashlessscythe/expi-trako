import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import prisma from "@/lib/prisma";
import { RequestStatus } from "@prisma/client";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { requestIds, status } = await request.json();
    if (!requestIds || !Array.isArray(requestIds) || !status) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    // Update all requests in a transaction
    await prisma.$transaction(async (tx) => {
      // Update each request's status
      await tx.mustGoRequest.updateMany({
        where: {
          id: {
            in: requestIds
          }
        },
        data: {
          status: status as RequestStatus
        }
      });

      // Create log entries for each request
      const logs = requestIds.map(requestId => ({
        mustGoRequestId: requestId,
        action: `Status updated to ${status} (Bulk Update)`,
        performedBy: session.user.id,
      }));

      await tx.requestLog.createMany({
        data: logs
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update request statuses");
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
