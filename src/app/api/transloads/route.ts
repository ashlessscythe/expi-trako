import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser, isAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !isAdmin(authUser)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch transload trailers and their associated request info
    const transloadTrailers = await prisma.trailer.findMany({
      where: { isTransload: true },
      select: {
        trailerNumber: true,
        createdAt: true,
        requests: {
          select: {
            request: {
              select: {
                plant: true,
                createdBy: true,
                creator: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Deduplicate by trailerNumber and date (YYYY-MM-DD)
    const uniqueTransloads = Array.from(
      new Map(
        transloadTrailers.map((t) => [
          `${t.trailerNumber}-${t.createdAt.toISOString().split("T")[0]}`,
          {
            date: t.createdAt.toISOString().split("T")[0],
            trailerNumber: t.trailerNumber,
            plant: t.requests[0]?.request?.plant || "N/A",
            createdBy: t.requests[0]?.request?.creator.name || "Unknown",
          },
        ])
      ).values()
    );

    // Convert to CSV format
    const csvHeader = "Date,Trailer Number,Plant,Created By\n";
    const csvRows = uniqueTransloads
      .map((t) => `${t.date},${t.trailerNumber},${t.plant},${t.createdBy}`)
      .join("\n");
    const csvData = csvHeader + csvRows;

    return new NextResponse(csvData, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=transloads.csv",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch transload trailers" },
      { status: 500 }
    );
  }
}
