import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcrypt";
import { getAuthUser, isAdmin } from "@/lib/auth";

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
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
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

    // Prepare update data
    const updateData: any = {
      name,
      email,
    };

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
        deleteMany: {}, // Remove all existing relationships
        create: sites.map((siteId) => ({ siteId })), // Create new relationships
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
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
    const { password: _, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
