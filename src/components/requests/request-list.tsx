"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { RequestStatus } from "@prisma/client";
import { BulkActionBar } from "./bulk-action-bar";
import { useRequestPagination } from "./hooks/useRequestPagination";
import { RequestTable } from "./components/RequestTable";
import { RequestCard } from "./components/RequestCard";
import { RequestFilters } from "./components/RequestFilters";
import { RequestPagination } from "./components/RequestPagination";
import type { RequestListProps, Request, FilterState } from "./types";

export default function RequestList({
  requests,
  showActions = true,
}: RequestListProps) {
  const initialRequests = requests || [];
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  // State for filters
  const [filters, setFilters] = useState<FilterState>({
    statusFilter: "ALL",
    plantFilter: "",
    searchQuery: "",
    dateRange: {
      start: "",
      end: "",
    },
    hideCompleted: false,
    sortField: "createdAt",
    sortDirection: "desc",
  });

  // Function to fetch requests with pagination and filters
  const fetchRequests = useCallback(
    async (page: number, pageSize: number, countOnly?: boolean) => {
      // Build query parameters
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("pageSize", pageSize.toString());

      if (countOnly) {
        params.set("countOnly", "true");
      }

      // Add filters
      if (filters.statusFilter !== "ALL") {
        params.set("status", filters.statusFilter);
      }

      if (filters.searchQuery) {
        params.set("search", filters.searchQuery);
      }

      // Add plant filter
      if (filters.plantFilter) {
        params.set("plant", filters.plantFilter);
      }

      // Add date range filters
      if (filters.dateRange.start) {
        params.set("startDate", filters.dateRange.start);
      }

      if (filters.dateRange.end) {
        params.set("endDate", filters.dateRange.end);
      }

      // Add showAll parameter from URL if present
      if (searchParams.get("showAll") === "true") {
        params.set("showAll", "true");
      }

      // Fetch data from API
      const response = await fetch(`/api/requests?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch requests");
      }

      return await response.json();
    },
    [
      filters.statusFilter,
      filters.searchQuery,
      filters.plantFilter,
      filters.dateRange.start,
      filters.dateRange.end,
      searchParams,
    ]
  );

  // Use our custom hook for pagination with server-side data fetching
  const {
    currentPage,
    totalPages,
    totalCount,
    paginatedRequests,
    isLoading,
    isBackgroundLoading,
    error,
    handlePageChange,
    getVisiblePages,
  } = useRequestPagination(fetchRequests);

  // Function to clear filters
  const clearFilters = () => {
    setFilters({
      statusFilter: "ALL",
      plantFilter: "",
      searchQuery: "",
      dateRange: {
        start: "",
        end: "",
      },
      hideCompleted: false,
      sortField: "createdAt",
      sortDirection: "desc",
    });
  };

  // Function to handle sorting
  const handleSort = (
    field: "shipmentNumber" | "plant" | "palletCount" | "status" | "createdAt"
  ) => {
    setFilters((prev) => ({
      ...prev,
      sortField: field,
      sortDirection:
        prev.sortField === field && prev.sortDirection === "desc"
          ? "asc"
          : "desc",
    }));
  };

  // Get unique plants for filter dropdown
  const uniquePlants = Array.from(
    new Set(paginatedRequests.map((req) => req.plant || "").filter(Boolean))
  );

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500 border rounded-md">
        Error loading requests: {error}
      </div>
    );
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this request?")) return;

    setDeleting(id);
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete request");
      }

      toast({
        title: "Success",
        description: "Request deleted successfully",
      });
      router.refresh();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete request";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleUndelete = async (id: string) => {
    if (!confirm("Are you sure you want to restore this request?")) return;

    setDeleting(id);
    try {
      const response = await fetch(`/api/requests/${id}/undelete`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to restore request");
      }

      toast({
        title: "Success",
        description: "Request restored successfully",
      });
      router.refresh();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to restore request";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleBulkStatusChange = (newStatus: RequestStatus) => {
    // Optimistically update UI
    setSelectedRequests([]);
    // Refresh in background to ensure data consistency
    router.refresh();
  };

  const downloadAsCSV = async () => {
    // Fetch all requests for CSV export
    try {
      // Show loading toast
      toast({
        title: "Preparing CSV",
        description: "Fetching all data for export...",
      });

      // Build query parameters for fetching all data
      const params = new URLSearchParams();

      // Add filters
      if (filters.statusFilter !== "ALL") {
        params.set("status", filters.statusFilter);
      }

      if (filters.searchQuery) {
        params.set("search", filters.searchQuery);
      }

      // Add plant filter
      if (filters.plantFilter) {
        params.set("plant", filters.plantFilter);
      }

      // Add date range filters
      if (filters.dateRange.start) {
        params.set("startDate", filters.dateRange.start);
      }

      if (filters.dateRange.end) {
        params.set("endDate", filters.dateRange.end);
      }

      // Add showAll parameter from URL if present
      if (searchParams.get("showAll") === "true") {
        params.set("showAll", "true");
      }

      // Set a large page size to get all data in one request
      params.set("pageSize", "1000");

      // Fetch data from API
      const response = await fetch(`/api/requests?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch requests for CSV export");
      }

      const data = await response.json();
      const allRequests = data.requests as Request[];

      // Convert requests to CSV format
      const headers = [
        "Shipment Number",
        "Plant",
        "Route Info",
        "Pallet Count",
        "Status",
        "Site",
        "AuthorizationNumber",
        "Trailer Number",
        "Trailer Status",
        "Is Transload",
        "Part Number",
        "Part Quantity",
        "Part Status",
        "Created By",
        "Creator Role",
        "Created At",
      ];

      const csvRows: string[][] = [];

      allRequests.forEach((request: Request) => {
        // If request has no trailers or parts, add a single row with request info
        if (request.trailers.length === 0 && request.partDetails.length === 0) {
          csvRows.push([
            request.shipmentNumber,
            request.plant || "",
            request.routeInfo || "",
            request.palletCount.toString(),
            request.status,
            request.site?.name || "nosite",
            request.authorizationNumber || "", // Authorization number
            "", // Empty trailer number
            "", // Empty trailer status
            "", // Empty is transload
            "", // Empty part number
            "", // Empty part quantity
            "", // Empty part status
            request.creator.name,
            request.creator.role,
            new Date(request.createdAt).toLocaleString(),
          ]);
          return;
        }

        // Group parts by trailer
        const trailerParts = request.partDetails.reduce(
          (acc: { [key: string]: typeof request.partDetails }, part) => {
            if (!acc[part.trailerId]) {
              acc[part.trailerId] = [];
            }
            acc[part.trailerId].push(part);
            return acc;
          },
          {} as { [key: string]: typeof request.partDetails }
        );

        // For each trailer, add rows with parts
        request.trailers.forEach((trailer) => {
          const parts = trailerParts[trailer.trailerId] || [];

          if (parts.length === 0) {
            // Add row for trailer without parts
            csvRows.push([
              request.shipmentNumber,
              request.plant || "",
              request.routeInfo || "",
              request.palletCount.toString(),
              request.status,
              request.site?.name || "nosite",
              request.authorizationNumber || "",
              trailer.trailer.trailerNumber,
              trailer.status,
              trailer.isTransload ? "Yes" : "No",
              "", // Empty part number
              "", // Empty part quantity
              "", // Empty part status
              request.creator.name,
              request.creator.role,
              new Date(request.createdAt).toLocaleString(),
            ]);
          } else {
            // Add rows for each part in the trailer
            parts.forEach((part) => {
              csvRows.push([
                request.shipmentNumber,
                request.plant || "",
                request.routeInfo || "",
                request.palletCount.toString(),
                request.status,
                request.site?.name || "nosite",
                request.authorizationNumber || "",
                trailer.trailer.trailerNumber,
                trailer.status,
                trailer.isTransload ? "Yes" : "No",
                part.partNumber,
                part.quantity.toString(),
                part.status,
                request.creator.name,
                request.creator.role,
                new Date(request.createdAt).toLocaleString(),
              ]);
            });
          }
        });

        // Add rows for parts without trailers (if any exist)
        const partsWithoutTrailers = request.partDetails.filter(
          (part) =>
            !request.trailers.some((t) => t.trailerId === part.trailerId)
        );

        partsWithoutTrailers.forEach((part) => {
          csvRows.push([
            request.shipmentNumber,
            request.plant || "",
            request.routeInfo || "",
            request.palletCount.toString(),
            request.status,
            request.site?.name || "nosite",
            request.authorizationNumber || "",
            "", // Empty trailer number
            "", // Empty trailer status
            "", // Empty is transload
            part.partNumber,
            part.quantity.toString(),
            part.status,
            request.creator.name,
            request.creator.role,
            new Date(request.createdAt).toLocaleString(),
          ]);
        });
      });

      // Add headers as first row
      csvRows.unshift(headers);

      // Convert to CSV string
      const csvString = csvRows
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      // Create and trigger download
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `requests-${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Success toast
      toast({
        title: "CSV Export Complete",
        description: "Your data has been downloaded",
      });
    } catch (error) {
      // Error toast
      toast({
        title: "CSV Export Failed",
        description:
          error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <RequestFilters
        filters={filters}
        onFiltersChange={(updates) => {
          setFilters((prev) => ({ ...prev, ...updates }));
        }}
        uniquePlants={uniquePlants}
        onClearFilters={clearFilters}
        onDownloadCSV={downloadAsCSV}
        userRole={user.role}
      />

      {isLoading ? (
        <div className="text-center py-8 border rounded-md">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      ) : paginatedRequests.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-md">
          No requests found
        </div>
      ) : (
        <>
          {/* Mobile View (Cards) */}
          <div className="md:hidden space-y-4">
            {paginatedRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                showActions={showActions}
                onDelete={handleDelete}
                onUndelete={handleUndelete}
                deleting={deleting}
                user={user}
                selected={selectedRequests.includes(request.id)}
                onSelect={(id, checked) =>
                  setSelectedRequests(
                    checked
                      ? [...selectedRequests, id]
                      : selectedRequests.filter((reqId) => reqId !== id)
                  )
                }
              />
            ))}
            <div className="relative">
              <RequestPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
              {isBackgroundLoading && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-muted-foreground animate-pulse">
                  Loading more data...
                </div>
              )}
            </div>
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden md:block">
            <RequestTable
              requests={paginatedRequests}
              selectedRequests={selectedRequests}
              onSelectRequest={(id, checked) =>
                setSelectedRequests(
                  checked
                    ? [...selectedRequests, id]
                    : selectedRequests.filter((reqId) => reqId !== id)
                )
              }
              onSelectAll={(checked) =>
                setSelectedRequests(
                  checked ? paginatedRequests.map((req) => req.id) : []
                )
              }
              sortField={filters.sortField}
              sortDirection={filters.sortDirection}
              onSort={handleSort}
              showActions={showActions}
              onDelete={handleDelete}
              onUndelete={handleUndelete}
              deleting={deleting}
              user={user}
            />
            <div className="relative mt-4">
              <RequestPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
              {isBackgroundLoading && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-muted-foreground animate-pulse">
                  Loading more data...
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {showActions && user.role === "ADMIN" && selectedRequests.length > 0 && (
        <BulkActionBar
          selectedRequests={selectedRequests}
          onStatusChange={handleBulkStatusChange}
          onClearSelection={() => setSelectedRequests([])}
        />
      )}
    </div>
  );
}
