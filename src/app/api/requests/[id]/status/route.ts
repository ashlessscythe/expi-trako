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
    const { trailerStatuses, partStatuses, trailerTransloads } = body as {
      trailerStatuses: Record<string, ItemStatus>;
      partStatuses: Record<string, ItemStatus>;
      trailerTransloads: Record<string, boolean>;
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

    // Get current state for logging changes
    const currentState = await prisma.mustGoRequest.findUnique({
      where: { id: params.id },
      include: {
        trailers: {
          include: {
            trailer: true,
          },
        },
        partDetails: true,
      },
    });

    if (!currentState) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Update in a transaction
    const updatedRequest = await prisma.$transaction(async (tx) => {
      const changes: string[] = [];

      // Update trailer statuses and transload flags
      for (const [id, newStatus] of Object.entries(trailerStatuses)) {
        const currentTrailer = currentState.trailers.find((t) => t.id === id);
        const newTransload = trailerTransloads[id];

        if (currentTrailer) {
          // Log status change if different
          if (currentTrailer.status !== newStatus) {
            changes.push(
              `Trailer ${currentTrailer.trailer.trailerNumber} status changed from ${currentTrailer.status} to ${newStatus}`
            );
          }

          // Log transload change if different
          if (currentTrailer.isTransload !== newTransload) {
            changes.push(
              `Trailer ${
                currentTrailer.trailer.trailerNumber
              } transload changed from ${
                currentTrailer.isTransload ? "yes" : "no"
              } to ${newTransload ? "yes" : "no"}`
            );
          }

          await tx.requestTrailer.update({
            where: { id },
            data: {
              status: newStatus,
              isTransload: newTransload,
            },
          });
        }
      }

      // Update part statuses
      for (const [id, newStatus] of Object.entries(partStatuses)) {
        const currentPart = currentState.partDetails.find((p) => p.id === id);

        if (currentPart && currentPart.status !== newStatus) {
          changes.push(
            `Part ${currentPart.partNumber} status changed from ${currentPart.status} to ${newStatus}`
          );

          await tx.partDetail.update({
            where: { id },
            data: { status: newStatus },
          });
        }
      }

      // Create log entries for all changes
      if (changes.length > 0) {
        await tx.requestLog.create({
          data: {
            mustGoRequestId: params.id,
            action: changes.join("; "),
            performedBy: user.id,
          },
        });
      }

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
    console.error("Failed to update item statuses");
    return NextResponse.json(
      { error: "Failed to update item statuses" },
      { status: 500 }
    );
  }
}
