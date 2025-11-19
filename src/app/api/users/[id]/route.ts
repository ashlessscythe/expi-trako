import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { getAuthUser, isAdmin } from "@/lib/auth";
import type { Prisma } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser();
    if (!isAdmin(authUser)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        site: true,
        userSites: {
          include: {
            site: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove password from response
    const { password: passwordHash, ...userWithoutPassword } = user;
    void passwordHash;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Failed to fetch user", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser();
    if (!isAdmin(authUser)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await request.json();
    const { name, email, password, sites } = data;

    const updateData: Prisma.UserUpdateInput & { siteId?: string | null } = {};

    if (typeof name === "string") {
      updateData.name = name;
    }
    if (typeof email === "string") {
      updateData.email = email;
    }

    // Only update password if provided
    if (password) {
      updateData.password = await hash(password, 10);
    }

    // Handle site relationships
    if (sites && Array.isArray(sites)) {
      // Set the first site as the primary site (backwards compatibility)
      updateData.siteId = sites[0] || null;

      // Update userSites relationship
      updateData.userSites = {
        deleteMany: { userId: params.id },
        create: sites.map((siteId) => ({ siteId })),
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData as Prisma.UserUpdateInput,
      include: {
        site: true,
        userSites: {
          include: {
            site: true,
          },
        },
      },
    });

    // Remove password from response
    const { password: updatedPasswordHash, ...userWithoutPassword } =
      updatedUser;
    void updatedPasswordHash;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Failed to update user", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
