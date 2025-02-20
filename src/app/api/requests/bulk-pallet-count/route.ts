import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { isCustomerService, isAdmin, isWarehouse } from "@/lib/auth";
import type { SessionUser, AuthUser } from "@/lib/types";

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as SessionUser;

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
