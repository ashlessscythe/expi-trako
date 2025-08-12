import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { FeedbackSubmittedEmail } from "@/components/email/feedback-submitted-email";
import { APP_NAME, EMAIL_AT } from "@/lib/config";
import { createElement } from "react";

// POST /api/feedback - Create new feedback
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to submit feedback" },
        { status: 401 }
      );
    }

    const { message } = await request.json();

    // Validate input
    if (!message || typeof message !== "string" || message.trim() === "") {
      return NextResponse.json(
        { error: "Feedback message is required" },
        { status: 400 }
      );
    }

    // Create feedback in database
    const feedback = await prisma.feedback.create({
      data: {
        message: message.trim(),
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            site: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Send confirmation email to user if email notifications are enabled
    try {
      console.log("Checking email settings for feedback confirmation...");
      const emailSetting = await prisma.systemSetting.findUnique({
        where: { key: "sendCompletionEmails" },
      });
      
      console.log("Email setting value:", emailSetting?.value);
      console.log("RESEND_API_KEY present:", !!process.env.RESEND_API_KEY);

      if (emailSetting?.value === "true") {
        console.log("Attempting to send feedback confirmation email to:", feedback.user.email);
        const emailResult = await sendEmail({
          from: `${APP_NAME} <feedback@${EMAIL_AT}>`,
          to: [feedback.user.email],
          subject: "Feedback Received - Thank You!",
          react: createElement(FeedbackSubmittedEmail, {
            name: feedback.user.name || "there",
            siteName: feedback.user.site?.name || "our platform",
          }),
        });
        
        if (emailResult.error) {
          console.error("Email service returned error:", emailResult.error);
        } else {
          console.log("Feedback confirmation email sent successfully to:", feedback.user.email);
        }
      } else {
        console.log("Email notifications disabled, skipping feedback confirmation email");
      }
    } catch (emailError) {
      console.error("Failed to send feedback confirmation email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      { message: "Feedback submitted successfully", id: feedback.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

// GET /api/feedback - Get all feedback (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to access this resource" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You do not have permission to access this resource" },
        { status: 403 }
      );
    }

    // Get query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};
    if (status) {
      where.status = status;
    }

    // Get feedback with pagination
    const [feedback, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.feedback.count({ where }),
    ]);

    return NextResponse.json({
      feedback,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}
