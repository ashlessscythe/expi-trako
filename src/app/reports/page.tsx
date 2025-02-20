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
import {
  StatusChart,
  TransloadChart,
  VolumeChart,
} from "@/components/reports/charts";
import { DateRange } from "@/components/reports/date-range";

// Add searchParams for date ranges
export interface PageProps {
  searchParams: {
    volumeStart?: string;
    volumeEnd?: string;
    transloadStart?: string;
    transloadEnd?: string;
  };
}

interface DailyRequestCount {
  date: Date;
  count: bigint;
}

async function getReportData(
  dateRanges: {
    volumeStart?: string;
    volumeEnd?: string;
    transloadStart?: string;
    transloadEnd?: string;
  },
  session: any
) {
  // Create base where clause for site filtering
  const baseWhere =
    session.user.role === "ADMIN" ? {} : { siteId: session.user.site?.id };
  // Default to last 30 days if no dates provided
  const now = new Date();
  const defaultStart = new Date();
  defaultStart.setDate(now.getDate() - 30);

  // Parse date ranges with fallbacks
  const volumeStart = dateRanges.volumeStart
    ? new Date(dateRanges.volumeStart)
    : defaultStart;
  const volumeEnd = dateRanges.volumeEnd ? new Date(dateRanges.volumeEnd) : now;
  const transloadStart = dateRanges.transloadStart
    ? new Date(dateRanges.transloadStart)
    : defaultStart;
  const transloadEnd = dateRanges.transloadEnd
    ? new Date(dateRanges.transloadEnd)
    : now;

  const [
    recentRequests,
    userStats,
    statusDistribution,
    transloadTrailers,
    dailyRequests,
  ] = await Promise.all([
    prisma.mustGoRequest.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      where: baseWhere,
      include: {
        creator: { select: { name: true, email: true } },
      },
    }),
    prisma.user.groupBy({
      by: ["role"],
      _count: true,
      ...(session.user.role !== "ADMIN" && {
        where: { siteId: session.user.site?.id },
      }),
    }),
    prisma.mustGoRequest.groupBy({
      by: ["status"],
      _count: true,
      where: baseWhere,
    }),
    prisma.requestTrailer.findMany({
      where: {
        isTransload: true,
        request: {
          ...baseWhere,
        },
      },
      select: {
        trailer: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    // Get daily request counts for the past month, grouped by date
    session.user.role === "ADMIN"
      ? prisma.$queryRaw<DailyRequestCount[]>`
          SELECT DATE("createdAt") as date, COUNT(*) as count 
          FROM "MustGoRequest" 
          WHERE "createdAt" >= ${volumeStart} 
          AND "createdAt" <= ${volumeEnd}
          GROUP BY DATE("createdAt")
          ORDER BY date ASC
        `
      : prisma.$queryRaw<DailyRequestCount[]>`
          SELECT DATE("createdAt") as date, COUNT(*) as count 
          FROM "MustGoRequest" 
          WHERE "createdAt" >= ${volumeStart} 
          AND "createdAt" <= ${volumeEnd}
          AND "siteId" = ${session.user.site?.id}
          GROUP BY DATE("createdAt")
          ORDER BY date ASC
        `,
  ]);

  // Process daily request data for the line chart
  const dailyRequestData = dailyRequests.map((day) => ({
    date: new Date(day.date).toISOString().split("T")[0],
    count: Number(day.count),
  }));

  // Filter transloads by selected date range
  const filteredTransloads = transloadTrailers.filter(
    (t) =>
      new Date(t.createdAt) >= transloadStart &&
      new Date(t.createdAt) <= transloadEnd
  );

  // Process status data for pie chart
  const statusData = statusDistribution.map((status) => ({
    name: status.status,
    value: status._count,
  }));

  // Process transload data - group by day
  const transloadByDay = filteredTransloads.reduce((acc, curr) => {
    const date = new Date(curr.createdAt).toISOString().split("T")[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const transloadData = Object.entries(transloadByDay)
    .map(([date, count]) => ({
      period: date,
      count,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));

  return {
    recentRequests,
    userStats,
    statusData,
    transloadData,
    dailyRequestData,
  };
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  // Only allow ADMIN and REPORT_RUNNER to access this page
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "REPORT_RUNNER")
  ) {
    redirect("/");
  }

  const {
    recentRequests,
    userStats,
    statusData,
    transloadData,
    dailyRequestData,
  } = await getReportData(
    {
      volumeStart: searchParams.volumeStart,
      volumeEnd: searchParams.volumeEnd,
      transloadStart: searchParams.transloadStart,
      transloadEnd: searchParams.transloadEnd,
    },
    session
  );

  // Format date for input default value
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 30);
  const defaultStartStr = defaultStart.toISOString().split("T")[0];
  const defaultEndStr = new Date().toISOString().split("T")[0];

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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Request Volume</h3>
              <DateRange
                startDate={searchParams.volumeStart}
                endDate={searchParams.volumeEnd}
                defaultStartDate={defaultStartStr}
                defaultEndDate={defaultEndStr}
                startParam="volumeStart"
                endParam="volumeEnd"
              />
            </div>
            <div className="h-[300px]">
              <VolumeChart data={dailyRequestData} />
            </div>
          </Card>

          {/* Transload Trailer Bar Chart */}
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Transload Trailers</h3>
              <DateRange
                startDate={searchParams.transloadStart}
                endDate={searchParams.transloadEnd}
                defaultStartDate={defaultStartStr}
                defaultEndDate={defaultEndStr}
                startParam="transloadStart"
                endParam="transloadEnd"
              />
            </div>
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
