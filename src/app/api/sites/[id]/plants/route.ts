import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { isAdmin } from "@/lib/auth";
import type { SessionUser } from "@/lib/types";

// GET /api/sites/[id]/plants
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = session.user as SessionUser;
    if (!isAdmin({ id: user.id, role: user.role })) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const siteId = params.id;
    if (!siteId) {
      return new NextResponse("Site ID is required", { status: 400 });
    }

    // Get unique plants from requests for this site
    const requests = await prisma.mustGoRequest.findMany({
      where: {
        siteId,
        plant: {
          not: null,
        },
      },
      select: {
        plant: true,
      },
      distinct: ["plant"],
    });

    // Extract and sort plant names
    const plants = requests
      .map((req) => req.plant as string)
      .sort((a, b) => a.localeCompare(b));

    return NextResponse.json(plants);
  } catch (error) {
    console.error("Error fetching plants:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
