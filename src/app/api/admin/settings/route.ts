import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const settings = await request.json();

    // Handle array of settings or single setting
    const updates = Array.isArray(settings) ? settings : [settings];

    // Update each setting
    const results = await Promise.all(
      updates.map((setting) =>
        prisma.systemSetting.upsert({
          where: { key: setting.key },
          update: {
            value: setting.value,
            type: setting.type,
            description: setting.description,
          },
          create: {
            key: setting.key,
            value: setting.value,
            type: setting.type,
            description: setting.description,
          },
        })
      )
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
