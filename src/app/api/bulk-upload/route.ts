import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { generateUniqueAuthNumber } from "@/hooks/useAuthNumber";
import { isCustomerService, isAdmin, isWarehouse } from "@/lib/auth";
import type { SessionUser, AuthUser } from "@/lib/types";
import { RequestStatus } from "@prisma/client";
import {
  sendCreationNotification,
  sendCostApprovalNotifications,
} from "@/lib/request-emails";

interface PartData {
  partNumber: string;
  quantity: number;
  shipmentNumber: string;
  plant: string;
  trailerNumber: string;
  routeInfo: string;
}

interface RowData {
  shipmentNumber: string;
  plant: string;
  parts: PartData[];
  routeInfo: string;
}

interface ValidationError {
  row: number;
  errors: string[];
}

interface ProcessResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: ValidationError[];
  requests: Array<{
    id: string;
    shipmentNumber: string;
    defaultPalletCount: number;
  }>;
}

type SplitCriteria = "shipment" | "trailer" | "route" | "part";

function validateRow(
  row: RowData,
  rowIndex: number
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!row.shipmentNumber) {
    errors.push("Shipment number is required");
  }
  if (!row.parts || row.parts.length === 0) {
    errors.push("At least one part with quantity is required");
  } else {
    row.parts.forEach((part, idx) => {
      if (!part.partNumber) {
        errors.push(`Part number is required for part ${idx + 1}`);
      }
      if (!part.quantity || isNaN(part.quantity) || part.quantity <= 0) {
        errors.push(`Valid quantity is required for part ${idx + 1}`);
      }
      if (!part.trailerNumber) {
        errors.push(`Trailer number is required for part ${idx + 1}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function groupDataByCriteria(
  rawData: any[],
  splitCriteria: SplitCriteria
): RowData[] {
  const groupedData: { [key: string]: RowData } = {};

  rawData.forEach((row) => {
    const shipmentNumber = row["SHIPMENT"]?.toString() || "";
    const plant = row["PLANT"]?.toString() || "N/A";
    const trailerNumber = row["1ST truck #"]?.toString() || "";
    const routeInfo = row["INSTRUCTIONS"]?.toString() || "";
    const partNumber = row["DELPHI P/N"]?.toString() || "";
    const quantity = parseInt(
      row["MG QTY"]?.toString() || row["qty"]?.toString() || "0"
    );

    if (!partNumber || !quantity) return;

    let groupKey: string;
    switch (splitCriteria) {
      case "shipment":
        groupKey = shipmentNumber;
        break;
      case "trailer":
        groupKey = `${trailerNumber || "no-trailer"}-${shipmentNumber}`;
        break;
      case "route":
        groupKey = `${routeInfo || "no-route"}-${shipmentNumber}`;
        break;
      case "part":
        groupKey = partNumber;
        break;
      default:
        groupKey = shipmentNumber;
    }

    if (!groupedData[groupKey]) {
      groupedData[groupKey] = {
        shipmentNumber: (() => {
          switch (splitCriteria) {
            case "trailer":
              return `group-${trailerNumber || "no-trailer"}-${shipmentNumber}`;
            case "part":
              return `${partNumber}-group`;
            case "route":
              return `group-${routeInfo || "no-route"}-${shipmentNumber}`;
            default:
              return shipmentNumber;
          }
        })(),
        plant,
        routeInfo,
        parts: [],
      };
    }

    groupedData[groupKey].parts.push({
      partNumber,
      quantity,
      shipmentNumber,
      plant,
      trailerNumber,
      routeInfo,
    });
  });

  return Object.values(groupedData);
}

// Function to parse CSV content
function parseCSV(csvContent: string): any[] {
  const lines = csvContent.split(/[\r\n]+/).filter((line) => line.trim());
  if (lines.length === 0) return [];

  // Extract headers from the first line
  const headers = lines[0].split(",").map((header) => header.trim());

  // Process data rows
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((value) => value.trim());
    if (values.length !== headers.length) continue; // Skip malformed rows

    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    data.push(row);
  }

  return data;
}

async function parseExcelFile(
  file: File,
  splitCriteria: SplitCriteria
): Promise<RowData[]> {
  // For Excel files, convert to CSV first
  // This is a fallback approach since we're having issues with ExcelJS
  const text = await file.text();

  // Check if it's already a CSV file
  if (file.name.toLowerCase().endsWith(".csv")) {
    const rawData = parseCSV(text);
    return groupDataByCriteria(rawData, splitCriteria);
  }

  // If it's an Excel file, we'll need to inform the user to use CSV instead
  throw new Error(
    "Excel file format is not supported. Please convert your file to CSV and try again."
  );
}

function parseRawText(text: string, splitCriteria: SplitCriteria): RowData[] {
  const decodedText = decodeURIComponent(text);
  const lines = decodedText.split(/[\r\n]+/).filter((line) => line.trim());
  const dataLines = lines.slice(1);

  const rawData = dataLines.map((line) => {
    const parts = line.split(/[\t,]+/).map((part) => part.trim());
    const [
      shipmentNumber,
      delivery,
      plant,
      customerPN,
      delphiPN,
      mgQty,
      instructions,
      trailerNumber,
      qty,
    ] = parts;

    return {
      SHIPMENT: shipmentNumber,
      PLANT: plant,
      "DELPHI P/N": delphiPN,
      "MG QTY": mgQty || qty,
      INSTRUCTIONS: instructions,
      "1ST truck #": trailerNumber,
    };
  });

  return groupDataByCriteria(rawData, splitCriteria);
}

/**
 * Checks if the error is related to a unique constraint violation
 * and returns a user-friendly error message
 */
function getUserFriendlyErrorMessage(error: Error): string {
  const errorMessage = error.message;

  // Check for unique constraint errors on partDetail
  if (
    errorMessage.includes("prisma.partDetail.create()") &&
    errorMessage.includes("Unique constraint failed")
  ) {
    return "Duplicate part detected: You have the same part number for the same trailer in your data. Please check your data for duplicate rows.";
  }

  // Check for other unique constraint errors
  if (errorMessage.includes("Unique constraint failed")) {
    return "Duplicate data detected: Your upload contains duplicate entries. Please check your data and remove any duplicates.";
  }

  // Return the original error message if it doesn't match any known patterns
  return "Database error: " + errorMessage;
}

async function processRows(
  rows: RowData[],
  userId: string,
  userRole: string,
  siteId: string | null,
  palletCounts: { [key: string]: number }
): Promise<ProcessResult> {
  const result: ProcessResult = {
    success: true,
    totalRows: rows.length,
    successfulRows: 0,
    failedRows: 0,
    errors: [],
    requests: [],
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const validation = validateRow(row, i);

    if (!validation.isValid) {
      result.failedRows++;
      result.errors.push({
        row: i + 1,
        errors: validation.errors,
      });
      continue;
    }

    try {
      const partsByTrailer = row.parts.reduce<{ [key: string]: PartData[] }>(
        (acc, part) => {
          if (!acc[part.trailerNumber]) {
            acc[part.trailerNumber] = [];
          }
          acc[part.trailerNumber].push(part);
          return acc;
        },
        {}
      );

      // Calculate default pallet count for this request
      const defaultPalletCount = row.parts.reduce((acc, part) => {
        return acc + Math.ceil(part.quantity / 24);
      }, 0);

      // Use provided pallet count or default
      const palletCount =
        palletCounts[row.shipmentNumber] || defaultPalletCount;

      const request = await prisma.$transaction(async (tx) => {
        // Generate unique authorization number using the hook
        const authorizationNumber = await generateUniqueAuthNumber(tx, userId);

        const newRequest = await tx.mustGoRequest.create({
          data: {
            shipmentNumber: row.shipmentNumber,
            plant: row.plant,
            routeInfo: row.routeInfo,
            palletCount,
            authorizationNumber,
            createdBy: userId,
            siteId: siteId,
            status:
              userRole === "WAREHOUSE"
                ? RequestStatus.REPORTING
                : RequestStatus.PENDING,
            logs: {
              create: {
                action: `Request created with ${row.parts.length} part number(s)`,
                performedBy: userId,
              },
            },
          },
        });

        for (const [trailerNumber, parts] of Object.entries(partsByTrailer)) {
          const trailer = await tx.trailer.upsert({
            where: {
              trailerNumber,
            },
            create: {
              trailerNumber,
            },
            update: {},
          });

          await tx.requestTrailer.create({
            data: {
              request: {
                connect: {
                  id: newRequest.id,
                },
              },
              trailer: {
                connect: {
                  id: trailer.id,
                },
              },
              isTransload: false,
            },
          });

          await Promise.all(
            parts.map((part) =>
              tx.partDetail.create({
                data: {
                  partNumber: part.partNumber,
                  quantity: part.quantity,
                  request: {
                    connect: {
                      id: newRequest.id,
                    },
                  },
                  trailer: {
                    connect: {
                      id: trailer.id,
                    },
                  },
                },
              })
            )
          );
        }

        return newRequest;
      });

      // Add request info to result for UI
      result.requests.push({
        id: request.id,
        shipmentNumber: row.shipmentNumber,
        defaultPalletCount,
      });

      // Get the full request details for notification after transaction completes
      const requestWithDetails = await prisma.mustGoRequest.findUnique({
        where: { id: request.id },
        include: {
          creator: {
            select: {
              name: true,
              email: true,
            },
          },
          trailers: {
            include: {
              trailer: true,
            },
          },
          partDetails: true,
        },
      });

      if (requestWithDetails) {
        try {
          // Only send the initial creation notification
          await sendCreationNotification(requestWithDetails);

          // Cost approval notifications will be sent after pallet count is updated
        } catch (emailError) {
          console.error("Error sending creation notification:", emailError);
          // Don't fail the request if email sending fails
        }
      }

      result.successfulRows++;
    } catch (error) {
      console.error("Failed to process row", error);
      result.failedRows++;
      result.errors.push({
        row: i + 1,
        errors: [getUserFriendlyErrorMessage(error as Error)],
      });
    }
  }

  result.success = result.failedRows === 0;
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as SessionUser;

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

    // Get all user's sites
    const userSites = [
      ...(dbUser.userSites?.map((us) => us.site) || []),
      ...(dbUser.site ? [dbUser.site] : []),
    ];
    // Remove duplicates
    const uniqueSites = Array.from(
      new Map(userSites.map((site) => [site.id, site])).values()
    );

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const text = formData.get("text") as string | null;
    const siteId = formData.get("siteId") as string | null;
    const palletCountsStr = formData.get("palletCounts") as string;
    const palletCounts = palletCountsStr ? JSON.parse(palletCountsStr) : {};
    const splitCriteria =
      (formData.get("splitCriteria") as SplitCriteria) || "shipment";

    // If user has multiple sites, require site selection
    if (uniqueSites.length > 1 && !siteId) {
      return NextResponse.json(
        { error: "Site selection is required" },
        { status: 400 }
      );
    }

    // Use provided siteId or default to user's only site
    const selectedSiteId = siteId || uniqueSites[0]?.id;

    let rows: RowData[] = [];

    if (file) {
      try {
        rows = await parseExcelFile(file, splitCriteria);
      } catch (error) {
        return NextResponse.json(
          { error: (error as Error).message },
          { status: 400 }
        );
      }
    } else if (text) {
      rows = parseRawText(text, splitCriteria);
    } else {
      return NextResponse.json(
        { error: "No file or text provided" },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No data found to process" },
        { status: 400 }
      );
    }

    // this is where the magic happens
    const result = await processRows(
      rows,
      dbUser.id,
      dbUser.role,
      selectedSiteId,
      palletCounts
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to process bulk upload", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
