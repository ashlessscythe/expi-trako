"use client";

import { APP_NAME } from "@/lib/config";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export function AdminHeader() {
  const pathname = usePathname();

  const adminLinks = [
    { href: "/", label: `${APP_NAME}`, roles: ["ADMIN", "REPORT_RUNNER"] },
    { href: "/admin", label: "Overview", roles: ["ADMIN"] },
    { href: "/admin/users", label: "Users", roles: ["ADMIN"] },
    { href: "/reports", label: "Reports", roles: ["ADMIN", "REPORT_RUNNER"] },
  ];

  // Get user role from session
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  // Filter links based on user role
  const authorizedLinks = adminLinks.filter((link) =>
    link.roles.includes(userRole as string)
  );

  return (
    <div className="border-b sticky top-0 bg-background z-50">
      <div className="container flex h-14 items-center">
        <nav className="flex gap-6">
          {authorizedLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
