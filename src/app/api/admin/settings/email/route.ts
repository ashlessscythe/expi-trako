import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: ["sendCompletionEmails", "sendNewUserEmails"]
        }
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to fetch email settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { key, value } = await req.json();

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update or create the setting
    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error("Failed to update email settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
