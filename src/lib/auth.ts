import { getServerSession } from "next-auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { authOptions } from "./auth-config";
import { AuthUser } from "./types";

export async function getAuthUser(): Promise<AuthUser> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  const authUser: AuthUser = {
    id: session.user.id,
    role: session.user.role as Role,
    site: session.user.site,
  };

  // Block PENDING users from accessing protected routes
  if (isPending(authUser)) {
    redirect("/pending");
  }

  return authUser;
}

export function isAdmin(user: AuthUser): boolean {
  return user.role === "ADMIN";
}

export function isWarehouse(user: AuthUser): boolean {
  return user.role === "WAREHOUSE" || user.role === "ADMIN";
}

export function isCustomerService(user: AuthUser): boolean {
  return user.role === "CUSTOMER_SERVICE" || user.role === "ADMIN";
}

export function isReportRunner(user: AuthUser): boolean {
  return user.role === "REPORT_RUNNER" || user.role === "ADMIN";
}

export function hasPermission(user: AuthUser, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(user.role) || user.role === "ADMIN";
}

export function isPending(user: AuthUser): boolean {
  return user.role === "PENDING";
}

export function isActiveUser(user: AuthUser): boolean {
  return user.role !== "PENDING";
}
