import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sites = await prisma.site.findMany({
      select: {
        id: true,
        name: true,
        locationCode: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(sites);
  } catch (error) {
    console.error("Failed to fetch sites:", error);
    return NextResponse.json(
      { error: "Failed to fetch sites" },
      { status: 500 }
    );
  }
}
