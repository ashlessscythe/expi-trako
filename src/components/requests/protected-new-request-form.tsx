"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { isCustomerService, isAdmin, isWarehouse } from "@/lib/auth";
import { AuthUser } from "@/lib/types";
import NewRequestForm from "@/components/requests/new-request-form";

export function ProtectedNewRequestForm() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Check auth in useEffect to avoid server-side window access
    if (!user) {
      router.push("/requests");
      return;
    }

    const authUser: AuthUser = {
      id: user.id,
      role: user.role,
      site: user.site,
    };

    if (
      !isCustomerService(authUser) &&
      !isAdmin(authUser) &&
      !isWarehouse(authUser)
    ) {
      router.push("/requests");
    }
  }, [user, router]);

  // Don't render form until we've checked auth
  if (!user) {
    return null;
  }

  const authUser: AuthUser = {
    id: user.id,
    role: user.role,
    site: user.site,
  };

  if (
    !isCustomerService(authUser) &&
    !isAdmin(authUser) &&
    !isWarehouse(authUser)
  ) {
    return null;
  }

  return <NewRequestForm userRole={user.role} userId={user.id} />;
}
