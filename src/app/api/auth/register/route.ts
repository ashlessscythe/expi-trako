import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { EmailTemplate } from "@/components/email-template";
import { NewUserEmail } from "@/components/new-user-email";
import { APP_NAME, EMAIL_AT } from "@/lib/config";
import { sendEmail } from "@/lib/email";
import { createElement } from "react";

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

    // Check if user already exists (email is now globally unique)
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with both new and old site relationships
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "PENDING", // Default role for new users
        siteId: site.id, // Maintain backwards compatibility
        userSites: {
          create: {
            siteId: site.id,
          },
        },
      },
      include: {
        site: true,
        userSites: {
          include: {
            site: true,
          },
        },
      },
    });

    // Send response immediately
    const response = NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );

    // Send emails asynchronously after response
    (async () => {
      try {
        // Send welcome email to new user
        await sendEmail({
          from: `${APP_NAME} <onboarding@${EMAIL_AT}>`,
          to: [email],
          subject: `Welcome to ${APP_NAME}`,
          react: createElement(EmailTemplate, { firstName: name || "there" }),
        });

        // Get system settings
        const settings = await prisma.systemSetting.findFirst({
          where: { key: "sendNewUserEmails" },
        });

        if (settings?.value === "true") {
          // Get all admin users
          const admins = await prisma.user.findMany({
            where: {
              role: "ADMIN",
            },
            select: {
              email: true,
            },
          });

          if (admins.length > 0) {
            // Send notification to all admins concurrently
            const adminEmailPromises = admins.map((admin) =>
              sendEmail({
                to: [admin.email],
                subject: `New User Registration in ${APP_NAME}`,
                react: createElement(NewUserEmail, {
                  username: name || "Unknown",
                  email,
                }),
              })
            );

            // Wait for all admin emails to complete, handling failures gracefully
            await Promise.allSettled(adminEmailPromises);
          }
        }
      } catch (emailError) {
        console.error("Failed to send emails:", emailError);
        // Errors are logged but don't affect the registration flow
      }
    })();

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
