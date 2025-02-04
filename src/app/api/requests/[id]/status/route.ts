import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { ItemStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth-config";
import type { AuthUser, SessionUser } from "@/lib/types";
import { isWarehouse } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const authUser: AuthUser = {
      id: user.id,
      role: user.role,
    };

    if (!isWarehouse(authUser)) {
      return NextResponse.json(
        { error: "Only warehouse staff can update item statuses" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { trailerStatuses, partStatuses } = body as {
      trailerStatuses: Record<string, ItemStatus>;
      partStatuses: Record<string, ItemStatus>;
    };

    // Validate status values
    const validStatuses = Object.values(ItemStatus);
    for (const status of [
      ...Object.values(trailerStatuses),
      ...Object.values(partStatuses),
    ]) {
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Invalid status provided" },
          { status: 400 }
        );
      }
    }

    // Update in a transaction
    const updatedRequest = await prisma.$transaction(async (tx) => {
      // Update trailer statuses
      const trailerUpdates = Object.entries(trailerStatuses).map(
        ([id, status]) =>
          tx.requestTrailer.update({
            where: { id },
            data: { status },
          })
      );

      // Update part statuses
      const partUpdates = Object.entries(partStatuses).map(([id, status]) =>
        tx.partDetail.update({
          where: { id },
          data: { status },
        })
      );

      // Execute all updates
      await Promise.all([...trailerUpdates, ...partUpdates]);

      // Create log entry
      await tx.requestLog.create({
        data: {
          mustGoRequestId: params.id,
          action: "Updated item statuses",
          performedBy: user.id,
        },
      });

      // Return updated request with all relations
      return tx.mustGoRequest.findUnique({
        where: { id: params.id },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          trailers: {
            include: {
              trailer: true,
            },
          },
          partDetails: {
            include: {
              trailer: true,
            },
          },
          logs: {
            include: {
              performer: {
                select: {
                  name: true,
                  role: true,
                },
              },
            },
            orderBy: {
              timestamp: "desc",
            },
          },
        },
      });
    });

    if (!updatedRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error updating item statuses:", error);
    return NextResponse.json(
      { error: "Failed to update item statuses" },
      { status: 500 }
    );
  }
}
