import { Card } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { EmailSettingsCard } from "@/components/admin/email-settings-card";

async function getAdminStats() {
  const [totalUsers, totalRequests, pendingRequests, completedRequests, totalSites] =
    await Promise.all([
      prisma.user.count(),
      prisma.mustGoRequest.count(),
      prisma.mustGoRequest.count({
        where: { status: "PENDING" },
      }),
      prisma.mustGoRequest.count({
        where: { status: "COMPLETED" },
      }),
      prisma.site.count({
        where: { isActive: true },
      }),
    ]);

  return {
    totalUsers,
    totalRequests,
    pendingRequests,
    completedRequests,
    totalSites,
  };
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">System Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Requests</p>
            <p className="text-2xl font-bold">{stats.totalRequests}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Pending Requests</p>
            <p className="text-2xl font-bold">{stats.pendingRequests}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Completed Requests</p>
            <p className="text-2xl font-bold">{stats.completedRequests}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Active Sites</p>
            <p className="text-2xl font-bold">{stats.totalSites}</p>
          </div>
        </Card>
      </div>

      <div className="mt-8 space-y-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <EmailSettingsCard />
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/admin/users"
            className="block p-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-center transition-colors"
          >
            Manage Users
          </a>
          <a
            href="/reports"
            className="block p-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg text-center transition-colors"
          >
            View Reports
          </a>
          <a
            href="/requests"
            className="block p-4 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg text-center transition-colors"
          >
            View All Requests
          </a>
          <a
            href="/admin/sites"
            className="block p-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-center transition-colors"
          >
            Manage Sites
          </a>
        </div>
      </div>
    </div>
  );
}
