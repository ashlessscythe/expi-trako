import { NotificationListManager } from "@/components/admin/notification-list-manager";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import type { SessionUser } from "@/lib/types";

export default async function NotificationListsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const user = session.user as SessionUser;
  if (!isAdmin({ id: user.id, role: user.role })) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Notification Lists</h2>
      </div>
      <NotificationListManager />
    </div>
  );
}
