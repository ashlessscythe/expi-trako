"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { RequestStatus } from "@prisma/client";
import { BulkActionBar } from "./bulk-action-bar";
import { useRequestFilters } from "./hooks/useRequestFilters";
import { useRequestPagination } from "./hooks/useRequestPagination";
import { RequestTable } from "./components/RequestTable";
import { RequestCard } from "./components/RequestCard";
import { RequestFilters } from "./components/RequestFilters";
import { RequestPagination } from "./components/RequestPagination";
import type { RequestListProps } from "./types";

export default function RequestList({
  requests: initialRequests = [],
  showActions = true,
}: RequestListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  // Use our custom hooks for filtering and pagination
  const {
    filters,
    setFilters,
    uniquePlants,
    filteredAndSortedRequests,
    clearFilters,
    handleSort,
  } = useRequestFilters(initialRequests);

  const {
    currentPage,
    totalPages,
    paginatedRequests,
    handlePageChange,
    getVisiblePages,
  } = useRequestPagination(filteredAndSortedRequests);

  if (!user) {
    return null;
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

  const downloadTransloadCSV = async () => {
    try {
      const response = await fetch("/api/transloads");
      if (!response.ok) throw new Error("Failed to download CSV");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "transloads.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // Silent fail - error shown to user via UI
    }
  };

  const downloadAsCSV = () => {
    // Convert filtered requests to CSV format
    const headers = [
      "Shipment Number",
      "Plant",
      "Route Info",
      "Pallet Count",
      "Status",
      "Site",
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

    filteredAndSortedRequests.forEach((request) => {
      // If request has no trailers or parts, add a single row with request info
      if (request.trailers.length === 0 && request.partDetails.length === 0) {
        csvRows.push([
          request.shipmentNumber,
          request.plant || "",
          request.routeInfo || "",
          request.palletCount.toString(),
          request.status,
          request.site?.name || "nosite",
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
        (part) => !request.trailers.some((t) => t.trailerId === part.trailerId)
      );

      partsWithoutTrailers.forEach((part) => {
        csvRows.push([
          request.shipmentNumber,
          request.plant || "",
          request.routeInfo || "",
          request.palletCount.toString(),
          request.status,
          request.site?.name || "nosite",
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
  };

  return (
    <div className="space-y-4">
      <RequestFilters
        filters={filters}
        onFiltersChange={setFilters}
        uniquePlants={uniquePlants}
        onClearFilters={clearFilters}
        onDownloadCSV={downloadAsCSV}
        onDownloadTransloads={downloadTransloadCSV}
        userRole={user.role}
      />

      {filteredAndSortedRequests.length === 0 ? (
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
            <RequestPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
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
            <RequestPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
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
