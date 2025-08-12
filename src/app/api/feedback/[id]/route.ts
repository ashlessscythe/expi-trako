import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import prisma from "@/lib/prisma";
import { FeedbackStatus } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import { FeedbackReviewedEmail } from "@/components/email/feedback-reviewed-email";
import { FeedbackResolvedEmail } from "@/components/email/feedback-resolved-email";
import { FeedbackDismissedEmail } from "@/components/email/feedback-dismissed-email";
import { APP_NAME, EMAIL_AT } from "@/lib/config";
import { createElement } from "react";

// PATCH /api/feedback/[id] - Update feedback status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const { status } = await request.json();

    // Validate input
    if (!status || !Object.values(FeedbackStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Check if feedback exists and get user details
    const existingFeedback = await prisma.feedback.findUnique({
      where: { id },
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

    if (!existingFeedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    // Update feedback status
    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: { status, updatedAt: new Date() },
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

    // Send notification email to user when feedback status changes (for any status change)
    if (status !== existingFeedback.status) {
      try {
        console.log(`Feedback status changing from ${existingFeedback.status} to ${status}`);
        // Check if email notifications are enabled
        console.log("Checking email settings for feedback status update...");
        const emailSetting = await prisma.systemSetting.findUnique({
          where: { key: "sendCompletionEmails" },
        });
        
        console.log("Email setting value:", emailSetting?.value);
        console.log("RESEND_API_KEY present:", !!process.env.RESEND_API_KEY);

        if (emailSetting?.value === "true") {
          let emailTemplate;
          let subject;
          
          switch (status) {
            case "REVIEWED":
              emailTemplate = FeedbackReviewedEmail;
              subject = `Feedback Reviewed - ${APP_NAME}`;
              break;
            case "RESOLVED":
              emailTemplate = FeedbackResolvedEmail;
              subject = `Feedback Resolved - ${APP_NAME}`;
              break;
            case "DISMISSED":
              emailTemplate = FeedbackDismissedEmail;
              subject = `Feedback Update - ${APP_NAME}`;
              break;
            default:
              emailTemplate = FeedbackReviewedEmail;
              subject = `Feedback ${status.toLowerCase()} - ${APP_NAME}`;
          }

          console.log(`Attempting to send feedback ${status.toLowerCase()} email to:`, updatedFeedback.user.email);
          const emailResult = await sendEmail({
            from: `${APP_NAME} <feedback@${EMAIL_AT}>`,
            to: [updatedFeedback.user.email],
            subject: subject,
            react: createElement(emailTemplate, {
              name: updatedFeedback.user.name || "there",
              adminName: session.user.name || "an administrator",
              siteName: updatedFeedback.user.site?.name || "our platform",
              feedbackMessage: updatedFeedback.message,
            }),
          });
          
          if (emailResult.error) {
            console.error(`Email service returned error for ${status} email:`, emailResult.error);
          } else {
            console.log(`Feedback ${status.toLowerCase()} email sent successfully to:`, updatedFeedback.user.email);
          }
        } else {
          console.log("Email notifications disabled, skipping feedback status update email");
        }
      } catch (emailError) {
        console.error("Failed to send feedback status update email:", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      message: "Feedback status updated successfully",
      feedback: updatedFeedback,
    });
  } catch (error) {
    console.error("Error updating feedback status:", error);
    return NextResponse.json(
      { error: "Failed to update feedback status" },
      { status: 500 }
    );
  }
}

// GET /api/feedback/[id] - Get a specific feedback
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Get feedback
    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}
