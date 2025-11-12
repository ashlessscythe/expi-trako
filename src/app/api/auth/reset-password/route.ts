import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Simple in-memory rate limiting (in production, use Redis or similar)
const resetAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = resetAttempts.get(identifier);

  if (!record || now - record.resetAt > RATE_LIMIT_WINDOW) {
    resetAttempts.set(identifier, { count: 1, resetAt: now });
    return true;
  }

  if (record.count >= MAX_ATTEMPTS) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    const { token, password, site: locationCode } = await request.json();

    if (!token || !password) {
      return Response.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Rate limiting by token (prevents brute force)
    if (!checkRateLimit(`reset:${token}`)) {
      return Response.json(
        { error: "Too many reset attempts. Please try again later." },
        { status: 429 }
      );
    }

    // Find user with valid reset token that hasn't expired
    // Using findUnique since resetToken is unique in schema
    const user = await prisma.user.findUnique({
      where: {
        resetToken: token,
      },
      include: {
        site: true,
      },
    });

    // Check if token exists, is valid, and not expired
    if (
      !user ||
      !user.resetTokenExpires ||
      user.resetTokenExpires <= new Date()
    ) {
      return Response.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Additional site validation if locationCode provided
    if (locationCode && user.site?.locationCode !== locationCode) {
      return Response.json(
        { error: "Invalid reset token for this site" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password and clear reset token atomically
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    // Clear rate limit on success
    resetAttempts.delete(`reset:${token}`);

    return Response.json({
      message: "Password has been reset successfully",
      site: user.site?.name || "Default Site",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return Response.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
