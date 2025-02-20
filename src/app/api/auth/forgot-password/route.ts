import { prisma } from "@/lib/prisma";
import { PasswordResetEmail } from "@/components/password-reset-email";
import crypto from "crypto";
import { APP_NAME, EMAIL_AT } from "@/lib/config";
import { sendEmail } from "@/lib/email";
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Find all users with this email across sites
    const users = await prisma.user.findMany({
      where: { email },
      include: {
        site: true,
      },
    });

    // If no users found, return success to prevent email enumeration
    if (users.length === 0) {
      return Response.json({
        message: "If an account exists, a reset email has been sent",
      });
    }

    // For now, we'll reset password for all instances of this email across sites
    for (const user of users) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

      // Save reset token and expiry to user record
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpires,
        },
      });

      // Generate reset link with site context
      const siteContext = user.site ? `&site=${user.site.locationCode}` : "";
      const resetLink = `${BASE_URL}/reset-password?token=${resetToken}${siteContext}`;

      // Send password reset email
      await sendEmail({
        from: `${APP_NAME} <pw-reset@${EMAIL_AT}>`,
        to: [user.email],
        subject: "Reset Your Password",
        react: PasswordResetEmail({
          resetLink,
          name: user.name,
          siteName: user.site?.name || "Default Site",
        }) as React.ReactElement,
      });
    }

    return Response.json({
      message: "If an account exists, a reset email has been sent",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return Response.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    );
  }
}
