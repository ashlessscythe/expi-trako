import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { isAdmin } from "@/lib/auth";
import type { SessionUser } from "@/lib/types";

// GET /api/notification-lists?siteId=xxx&plant=yyy
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = session.user as SessionUser;
    if (!isAdmin({ id: user.id, role: user.role })) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get("siteId");
    const plant = searchParams.get("plant")?.toUpperCase();

    if (!siteId || !plant) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    const notificationList = await prisma.plantNotificationList.findUnique({
      where: {
        siteId_plant: {
          siteId,
          plant,
        },
      },
    });

    return NextResponse.json(notificationList || { siteId, plant, emails: [] });
  } catch (error) {
    console.error("Error fetching notification list:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/notification-lists
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = session.user as SessionUser;
    if (!isAdmin({ id: user.id, role: user.role })) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await request.json();
    const { siteId, plant: rawPlant, emails, emailLevels, enabled } = body;
    const plant = rawPlant?.toUpperCase();

    if (!siteId || !plant || !emails || enabled === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const notificationList = await prisma.plantNotificationList.create({
      data: {
        siteId,
        plant,
        emails,
        emailLevels,
        enabled,
      },
    });

    return NextResponse.json(notificationList);
  } catch (error) {
    console.error("Error creating notification list:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PUT /api/notification-lists
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = session.user as SessionUser;
    if (!isAdmin({ id: user.id, role: user.role })) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await request.json();
    const { siteId, plant: rawPlant, emails, emailLevels, enabled } = body;
    const plant = rawPlant?.toUpperCase();

    if (!siteId || !plant || !emails || enabled === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const notificationList = await prisma.plantNotificationList.upsert({
      where: {
        siteId_plant: {
          siteId,
          plant,
        },
      },
      create: {
        siteId,
        plant,
        emails,
        emailLevels,
        enabled,
      },
      update: {
        emails,
        emailLevels,
        enabled,
      },
    });

    return NextResponse.json(notificationList);
  } catch (error) {
    console.error("Error updating notification list:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
