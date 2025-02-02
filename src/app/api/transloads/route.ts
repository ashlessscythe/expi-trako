import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, isAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !isAdmin(authUser)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch transload trailers and their associated request info
    const transloadTrailers = await prisma.requestTrailer.findMany({
      where: { isTransload: true },
      include: {
        trailer: {
          select: {
            trailerNumber: true,
          },
        },
        request: {
          select: {
            plant: true,
            creator: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Group by trailer number and date using RequestTrailer's createdAt
    const transloadsByDay = transloadTrailers.reduce((acc, t) => {
      const date = t.createdAt.toISOString().split("T")[0];
      const key = `${t.trailer.trailerNumber}-${date}`;
      
      // Only take the first occurrence per trailer per day
      if (!acc.has(key)) {
        acc.set(key, {
          date,
          trailerNumber: t.trailer.trailerNumber,
          plant: t.request.plant || "N/A",
          createdBy: t.request.creator.name || "Unknown",
        });
      }
      return acc;
    }, new Map());

    // Convert to array of unique transloads (allowing same trailer on different days)
    const uniqueTransloads = Array.from(transloadsByDay.values());

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
