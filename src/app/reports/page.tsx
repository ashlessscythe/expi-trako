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
import { StatusChart, TransloadChart, VolumeChart } from "@/components/reports/charts";

interface DailyRequestCount {
  date: Date;
  count: bigint;
}


async function getReportData() {
  const now = new Date();
  const lastDay = new Date();
  lastDay.setDate(now.getDate() - 1);

  const last3Days = new Date();
  last3Days.setDate(now.getDate() - 3);

  const lastWeek = new Date();
  lastWeek.setDate(now.getDate() - 7);

  const lastMonth = new Date();
  lastMonth.setDate(now.getDate() - 30);

  const [recentRequests, userStats, statusDistribution, transloadTrailers, dailyRequests] = await Promise.all([
    prisma.mustGoRequest.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        creator: { select: { name: true, email: true } },
      },
    }),
    prisma.user.groupBy({ by: ["role"], _count: true }),
    prisma.mustGoRequest.groupBy({ by: ["status"], _count: true }),

    prisma.requestTrailer.findMany({
      where: { isTransload: true },
      select: {
        trailer: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    // Get daily request counts for the past month, grouped by date
    prisma.$queryRaw<DailyRequestCount[]>`
      SELECT DATE("createdAt") as date, COUNT(*) as count 
      FROM "MustGoRequest" 
      WHERE "createdAt" >= ${lastMonth}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `
  ]);

  // Process daily request data for the line chart
  const dailyRequestData = dailyRequests.map((day) => ({
    date: new Date(day.date).toISOString().split('T')[0],
    count: Number(day.count)
  }));

  // Categorize transloads by time range with proper date ranges
  const transloadStats = {
    lastDay: transloadTrailers.filter((t) => new Date(t.createdAt) >= lastDay && new Date(t.createdAt) < now),
    last3Days: transloadTrailers.filter((t) => new Date(t.createdAt) >= last3Days && new Date(t.createdAt) < lastDay),
    lastWeek: transloadTrailers.filter((t) => new Date(t.createdAt) >= lastWeek && new Date(t.createdAt) < last3Days),
  };

  // Process status data for pie chart
  const statusData = statusDistribution.map(status => ({
    name: status.status,
    value: status._count,
  }));

  // Process transload data for bar chart
  const transloadData = [
    { period: 'Last 24h', count: transloadStats.lastDay.length },
    { period: 'Last 3d', count: transloadStats.last3Days.length },
    { period: 'Last 7d', count: transloadStats.lastWeek.length },
  ];

  return { 
    recentRequests, 
    userStats, 
    statusData, 
    transloadData,
    dailyRequestData,
    transloadStats 
  };
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

  const { recentRequests, userStats, statusData, transloadData, dailyRequestData, transloadStats } =
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

            {/* Request Status Distribution Pie Chart */}
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">
                Request Status Distribution
              </h3>
              <div className="h-[300px]">
                <StatusChart data={statusData} />
              </div>
            </Card>
          </div>

          {/* Request Volume Over Time */}
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Request Volume (30 Days)</h3>
            <div className="h-[300px]">
                <VolumeChart data={dailyRequestData} />
            </div>
          </Card>

          {/* Transload Trailer Bar Chart */}
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Transload Trailers by Period</h3>
            <div className="h-[300px]">
                <TransloadChart data={transloadData} />
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
