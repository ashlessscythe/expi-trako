import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { Header } from "@/components/header";
import RequestList from "@/components/requests/request-list";
import { NewRequestButton } from "@/components/requests/new-request-button";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Requests | Expi-Trako",
  description: "View and manage must-go requests",
};

// Set revalidation to 0 to opt out of caching
export const revalidate = 0;

async function getRequests(userId: string, role: string) {
  // Only filter by creator for customer service
  // Admin and warehouse see all requests
  const where = {
    ...(role === "CUSTOMER_SERVICE" && { createdBy: userId }),
    deleted: false,
  };

  console.log("Query where:", where); // Debug log

  const requests = await prisma.mustGoRequest.findMany({
    where,
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      trailers: {
        include: {
          trailer: true,
        },
      },
      partDetails: true,
      logs: {
        include: {
          performer: {
            select: {
              name: true,
              role: true,
            },
          },
        },
        orderBy: {
          timestamp: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Format all dates to ISO strings and ensure all fields are present
  return requests.map((request) => ({
    ...request,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    deletedAt: request.deletedAt?.toISOString() || null,
    additionalNotes: request.additionalNotes || null,
    notes: request.notes || [],
    trailers: request.trailers.map((trailer) => ({
      ...trailer,
      createdAt: trailer.createdAt.toISOString(),
      trailer: {
        ...trailer.trailer,
        createdAt: trailer.trailer.createdAt.toISOString(),
        updatedAt: trailer.trailer.updatedAt.toISOString(),
      },
    })),
    partDetails: request.partDetails.map((detail) => ({
      ...detail,
      createdAt: detail.createdAt.toISOString(),
      updatedAt: detail.updatedAt.toISOString(),
    })),
    logs: request.logs.map((log) => ({
      ...log,
      timestamp: log.timestamp.toISOString(),
    })),
  }));
}

export default async function RequestsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const requests = await getRequests(session.user.id, session.user.role);

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Must-Go Requests</h1>
          <NewRequestButton />
        </div>
        <RequestList requests={requests} />
      </div>
    </>
  );
}
