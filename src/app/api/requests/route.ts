import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { RequestStatus, Prisma } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { authOptions } from "@/lib/auth-config";

import { generateUniqueAuthNumber } from "@/hooks/useAuthNumber";
import { isCustomerService, isAdmin, isWarehouse } from "@/lib/auth";
import type { AuthUser, SessionUser, FormData } from "@/lib/types";

// GET /api/requests - List all requests with optional filters
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as SessionUser;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const includeDeleted = searchParams.get("includeDeleted") === "true";
    const showAll = searchParams.get("showAll") === "true";

    const where: Prisma.MustGoRequestWhereInput = {
      ...(status && { status: status as RequestStatus }),
      ...(!includeDeleted && { deleted: false }),
      ...(user.role === "CUSTOMER_SERVICE" &&
        !showAll && { createdBy: user.id }),
      // If not admin, show requests from any of user's sites (old or new relationship) or requests without a site
      ...(user.role !== "ADMIN" && {
        OR: [
          { siteId: null },
          ...(user.site ? [{ siteId: user.site.id }] : []),
          {
            siteId: {
              in: (
                await prisma.userSite.findMany({
                  where: { userId: user.id },
                  select: { siteId: true },
                })
              ).map((us) => us.siteId),
            },
          },
        ],
      }),
    };

    if (search) {
      where.OR = [
        {
          shipmentNumber: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          partDetails: {
            some: {
              partNumber: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          },
        },
        {
          trailers: {
            some: {
              trailer: {
                trailerNumber: {
                  contains: search,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
          },
        },
      ];
    }

    const requests = await prisma.mustGoRequest.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            site: true,
          },
        },
        site: true,
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

    // Add cache control headers for revalidation
    const response = NextResponse.json(requests);
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
    return response;
  } catch (error) {
    console.error("Failed to fetch requests");
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

// POST /api/requests - Create a new request
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as SessionUser;

    // Verify user exists in database and get their sites
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        site: true,
        userSites: {
          include: {
            site: true,
          },
        },
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    const authUser: AuthUser = {
      id: dbUser.id,
      role: dbUser.role,
    };

    if (
      !isCustomerService(authUser) &&
      !isAdmin(authUser) &&
      !isWarehouse(authUser)
    ) {
      return NextResponse.json(
        { error: "Only customer service and warehouse can create requests" },
        { status: 403 }
      );
    }

    const body = (await req.json()) as FormData;

    const {
      shipmentNumber,
      plant,
      trailers,
      palletCount,
      routeInfo,
      additionalNotes,
    } = body;

    // Validate required fields
    if (!shipmentNumber || !trailers?.length || !palletCount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate plant format if provided
    if (plant && !/^[a-zA-Z0-9]{4}$/.test(plant)) {
      return NextResponse.json(
        { error: "Plant must be exactly 4 alphanumeric characters" },
        { status: 400 }
      );
    }

    // Validate trailers and parts
    for (const trailer of trailers) {
      if (!trailer.trailerNumber) {
        return NextResponse.json(
          { error: "All trailer numbers are required" },
          { status: 400 }
        );
      }
      if (!trailer.parts?.length) {
        return NextResponse.json(
          {
            error: `Trailer ${trailer.trailerNumber} must have at least one part number`,
          },
          { status: 400 }
        );
      }
    }

    // Create everything in a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the request first
      // Generate unique authorization number
      const authorizationNumber = await generateUniqueAuthNumber(tx);

      const request = await tx.mustGoRequest.create({
        data: {
          shipmentNumber,
          plant,
          palletCount,
          routeInfo,
          additionalNotes,
          authorizationNumber,
          createdBy: dbUser.id,
          // Use old site relationship first, then first site from userSites if available
          siteId: dbUser.site?.id || dbUser.userSites[0]?.site.id || null,
          status:
            dbUser.role === "WAREHOUSE"
              ? RequestStatus.REPORTING
              : RequestStatus.PENDING,
          logs: {
            create: {
              action: `Request created with ${trailers.length} trailer(s)`,
              performedBy: dbUser.id,
            },
          },
        },
      });

      // Process each trailer and its parts
      for (const trailerData of trailers) {
        // Create or update the trailer
        const trailer = await tx.trailer.upsert({
          where: {
            trailerNumber: trailerData.trailerNumber,
          },
          create: {
            trailerNumber: trailerData.trailerNumber,
          },
          update: {},
        });

        // Link trailer to request with isTransload flag
        await tx.requestTrailer.create({
          data: {
            requestId: request.id,
            trailerId: trailer.id,
            isTransload: trailerData.isTransload || false,
          },
        });

        // Create part details for this trailer
        await Promise.all(
          trailerData.parts.map((part) =>
            tx.partDetail.create({
              data: {
                partNumber: part.partNumber,
                quantity: part.quantity,
                requestId: request.id,
                trailerId: trailer.id,
              },
            })
          )
        );
      }

      // Return complete request with all relations
      return tx.mustGoRequest.findUnique({
        where: { id: request.id },
        include: {
          creator: {
            select: {
              name: true,
              email: true,
              role: true,
              site: true,
            },
          },
          site: true,
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
          },
        },
      });
    });

    // Add cache control headers to ensure clients revalidate
    const response = NextResponse.json(result, { status: 201 });
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
    return response;
  } catch (error) {
    console.error("Failed to create request");
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}
