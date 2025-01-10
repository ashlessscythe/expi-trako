import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { Header } from "@/components/header";
import prisma from "@/lib/prisma";

async function getRequestCounts(userId: string, role: string) {
  const baseWhere = {
    ...(role === "CUSTOMER_SERVICE" && { createdBy: userId }),
    deleted: false,
  };

  if (role === "WAREHOUSE") {
    const pendingCount = await prisma.mustGoRequest.count({
      where: {
        ...baseWhere,
        status: "PENDING",
      },
    });

    const activeCount = await prisma.mustGoRequest.count({
      where: {
        ...baseWhere,
        status: {
          in: ["APPROVED", "IN_PROGRESS", "LOADING", "IN_TRANSIT"],
        },
      },
    });

    return { pendingCount, activeCount };
  } else {
    const activeCount = await prisma.mustGoRequest.count({
      where: {
        ...baseWhere,
        status: {
          notIn: ["COMPLETED", "REJECTED", "CANCELLED", "FAILED"],
        },
      },
    });

    const completedCount = await prisma.mustGoRequest.count({
      where: {
        ...baseWhere,
        status: "COMPLETED",
      },
    });

    return { activeCount, completedCount };
  }
}

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  const counts = await getRequestCounts(session.user.id, session.user.role);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container flex flex-col items-center justify-center py-10">
        <div className="w-full max-w-4xl space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {session.user.name || session.user.email}
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
            <p className="text-muted-foreground mb-4">
              {session.user.role === "WAREHOUSE"
                ? "View and process incoming requests. Monitor pending and active requests below."
                : 'Click the "Requests" button above to view requests. You can track all your requests here on the dashboard.'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {session.user.role === "WAREHOUSE" ? (
                <>
                  <div className="p-4 rounded-lg border bg-background">
                    <h3 className="font-medium mb-2">Pending Requests</h3>
                    <p className="text-2xl font-bold">{counts.pendingCount}</p>
                    <p className="text-sm text-muted-foreground">
                      Awaiting processing
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border bg-background">
                    <h3 className="font-medium mb-2">Active Requests</h3>
                    <p className="text-2xl font-bold">{counts.activeCount}</p>
                    <p className="text-sm text-muted-foreground">
                      In progress or transit
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-lg border bg-background">
                    <h3 className="font-medium mb-2">Active Requests</h3>
                    <p className="text-2xl font-bold">{counts.activeCount}</p>
                    <p className="text-sm text-muted-foreground">
                      Currently in progress
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border bg-background">
                    <h3 className="font-medium mb-2">Completed</h3>
                    <p className="text-2xl font-bold">
                      {counts.completedCount}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Successfully processed
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">
              Your Role: {session.user.role}
            </h2>
            <div className="space-y-4">
              {session.user.role === "ADMIN" && (
                <div>
                  <h3 className="font-medium">Admin Controls</h3>
                  <p className="text-muted-foreground">
                    Manage users and system settings
                  </p>
                </div>
              )}
              {session.user.role === "CUSTOMER_SERVICE" && (
                <div>
                  <h3 className="font-medium">Customer Service Tools</h3>
                  <p className="text-muted-foreground">
                    Handle customer requests and inquiries
                  </p>
                </div>
              )}
              {session.user.role === "WAREHOUSE" && (
                <div>
                  <h3 className="font-medium">Warehouse Operations</h3>
                  <p className="text-muted-foreground">
                    Manage inventory and shipments
                  </p>
                </div>
              )}
              {session.user.role === "REPORT_RUNNER" && (
                <div>
                  <h3 className="font-medium">Reports</h3>
                  <p className="text-muted-foreground">
                    Generate and view system reports
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
