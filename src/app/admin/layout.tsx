import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { AdminHeader } from "@/components/admin/admin-header";
import { headers } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  const isAdmin = session.user.role === "ADMIN";
  const isReportRunner = session.user.role === "REPORT_RUNNER";
  const headersList = headers();
  const pathname = headersList.get("x-invoke-path") || "";

  // Only allow ADMIN for /admin/users
  if (pathname.includes("/admin/users") && !isAdmin) {
    redirect("/");
  }

  // Allow both ADMIN and REPORT_RUNNER for reports
  if (pathname.includes("/reports") && !isAdmin && !isReportRunner) {
    redirect("/");
  }

  // For other admin routes, require ADMIN
  if (!pathname.includes("/reports") && !isAdmin) {
    redirect("/");
  }

  return (
    <div>
      <AdminHeader />
      <div className="container mx-auto py-6">
        <div className="flex flex-col space-y-8">{children}</div>
      </div>
    </div>
  );
}
