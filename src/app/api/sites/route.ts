import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser, isAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!isAdmin(authUser)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, locationCode } = await request.json();

    if (!name || !locationCode) {
      return NextResponse.json(
        { error: "Name and location code are required" },
        { status: 400 }
      );
    }

    const site = await prisma.site.create({
      data: {
        name,
        locationCode,
        isActive: true,
      },
    });

    return NextResponse.json(site);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create site" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!isAdmin(authUser)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, name, locationCode } = await request.json();

    if (!id || !name || !locationCode) {
      return NextResponse.json(
        { error: "ID, name and location code are required" },
        { status: 400 }
      );
    }

    const site = await prisma.site.update({
      where: { id },
      data: {
        name,
        locationCode,
      },
    });

    return NextResponse.json(site);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update site" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!isAdmin(authUser)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Site ID is required" },
        { status: 400 }
      );
    }

    await prisma.site.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete site" },
      { status: 500 }
    );
  }
}

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
