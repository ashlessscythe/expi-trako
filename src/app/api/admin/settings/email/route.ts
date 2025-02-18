import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import type { AuthUser, SessionUser } from "@/lib/types";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const authUser: AuthUser = {
      id: user.id,
      role: user.role,
    };

    if (!isAdmin(authUser)) {
      return NextResponse.json(
        { error: "Only admins can access settings" },
        { status: 403 }
      );
    }

    // Get the setting from the database
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "sendCompletionEmails" },
    });

    return NextResponse.json({
      sendCompletionEmails: setting?.value === "true",
    });
  } catch (error) {
    console.error("Failed to fetch email settings");
    return NextResponse.json(
      { error: "Failed to fetch email settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const authUser: AuthUser = {
      id: user.id,
      role: user.role,
    };

    if (!isAdmin(authUser)) {
      return NextResponse.json(
        { error: "Only admins can update settings" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { sendCompletionEmails } = body;

    if (typeof sendCompletionEmails !== "boolean") {
      return NextResponse.json(
        { error: "Invalid setting value" },
        { status: 400 }
      );
    }

    // Update or create the setting
    await prisma.systemSetting.upsert({
      where: { key: "sendCompletionEmails" },
      update: { value: String(sendCompletionEmails) },
      create: {
        key: "sendCompletionEmails",
        value: String(sendCompletionEmails),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update email settings");
    return NextResponse.json(
      { error: "Failed to update email settings" },
      { status: 500 }
    );
  }
}
