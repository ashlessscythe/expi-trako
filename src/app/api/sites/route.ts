import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser, isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!isAdmin(authUser)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const sites = await prisma.site.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        locationCode: true,
      },
    });

    return NextResponse.json(sites);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch sites" },
      { status: 500 }
    );
  }
}
