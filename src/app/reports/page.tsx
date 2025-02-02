import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-config";
import { Header } from "@/components/header";


async function getReportData() {
  const now = new Date();
  const lastDay = new Date();
  lastDay.setDate(now.getDate() - 1);

  const last3Days = new Date();
  last3Days.setDate(now.getDate() - 3);

  const lastWeek = new Date();
  lastWeek.setDate(now.getDate() - 7);

  const [recentRequests, userStats, statusDistribution, transloadTrailers] = await Promise.all([
    prisma.mustGoRequest.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        creator: { select: { name: true, email: true } },
      },
    }),
    prisma.user.groupBy({ by: ["role"], _count: true }),
    prisma.mustGoRequest.groupBy({ by: ["status"], _count: true }),

    // Fetch transload trailers
    prisma.trailer.findMany({
      where: { isTransload: true },
      select: {
        trailerNumber: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Deduplicate by trailerNumber and createdAt (YYYY-MM-DD)
  const dedupedTransloads = Array.from(
    new Map(
      transloadTrailers.map((t) => [`${t.trailerNumber}-${t.createdAt.toISOString().split("T")[0]}`, t])
    ).values()
  );

  // Categorize by time range
  const transloadStats = {
    lastDay: dedupedTransloads.filter((t) => new Date(t.createdAt) >= lastDay),
    last3Days: dedupedTransloads.filter((t) => new Date(t.createdAt) >= last3Days),
    lastWeek: dedupedTransloads.filter((t) => new Date(t.createdAt) >= lastWeek),
  };

  return { recentRequests, userStats, statusDistribution, transloadStats };
}

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);

  // Only allow ADMIN and REPORT_RUNNER to access this page
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "REPORT_RUNNER")
  ) {
    redirect("/");
  }

  const { recentRequests, userStats, statusDistribution, transloadStats } =
    await getReportData();

  return (
    <>
      <Header />
      <div className="container mx-auto py-6">
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold">System Reports</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Role Distribution */}
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">
                User Role Distribution
              </h3>
              <div className="space-y-2">
                {userStats.map((stat) => (
                  <div
                    key={stat.role}
                    className="flex justify-between items-center"
                  >
                    <span className="text-muted-foreground">{stat.role}</span>
                    <span className="font-medium">{stat._count}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Request Status Distribution */}
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">
                Request Status Distribution
              </h3>
              <div className="space-y-2">
                {statusDistribution.map((stat) => (
                  <div
                    key={stat.status}
                    className="flex justify-between items-center"
                  >
                    <span className="text-muted-foreground">{stat.status}</span>
                    <span className="font-medium">{stat._count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Transload Trailer Summary */}
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Transload Trailers by Date</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last 24 Hours</span>
                <span className="font-medium">{transloadStats.lastDay.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last 3 Days</span>
                <span className="font-medium">{transloadStats.last3Days.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last 7 Days</span>
                <span className="font-medium">{transloadStats.lastWeek.length}</span>
              </div>
            </div>
          </Card>

          {/* Recent Requests Table */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Recent Requests</h3>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shipment Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.shipmentNumber}</TableCell>
                      <TableCell>
                        <span
                          className={
                            request.status === "COMPLETED"
                              ? "text-green-600 dark:text-green-400"
                              : request.status === "IN_PROGRESS"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-yellow-600 dark:text-yellow-400"
                          }
                        >
                          {request.status}
                        </span>
                      </TableCell>
                      <TableCell>{request.creator.name}</TableCell>
                      <TableCell>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
