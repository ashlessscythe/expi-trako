import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";
import { APP_NAME, EMAIL_AT } from "@/lib/config";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, password, siteId } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get default site if no siteId provided
    const site = siteId
      ? await prisma.site.findUnique({
          where: { id: siteId },
        })
      : await prisma.site.findFirst({
          where: { locationCode: "DEFAULT" },
        });

    if (!site) {
      return NextResponse.json(
        { error: "Invalid site or no default site found" },
        { status: 400 }
      );
    }

    // Check if user already exists in this site
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        siteId: site.id,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "PENDING", // Default role for new users
        siteId: site.id,
      },
      include: {
        site: true,
      },
    });

    // Send welcome email
    try {
      await resend.emails.send({
        from: `${APP_NAME} <onboarding@${EMAIL_AT}>`,
        to: email,
        subject: `Welcome to ${APP_NAME}`,
        react: EmailTemplate({
          firstName: name || "there",
        }),
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Continue with registration even if email fails
    }

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
