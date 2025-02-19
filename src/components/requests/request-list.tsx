"use client";

import { useState, useEffect, useMemo, useCallback, Fragment } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusToggle } from "@/components/requests/status-toggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { RequestStatus, ItemStatus } from "@prisma/client";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

interface RequestCreator {
  id: string;
  name: string;
  role: string;
}

interface Request {
  id: string;
  shipmentNumber: string;
  plant: string | null;
  routeInfo: string | null;
  additionalNotes: string | null;
  notes: string[];
  palletCount: number;
  status: RequestStatus;
  creator: RequestCreator;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  deletedAt: string | null;
  trailers: {
    id: string;
    requestId: string;
    trailerId: string;
    trailer: {
      id: string;
      trailerNumber: string;
      createdAt: string;
      updatedAt: string;
    };
    status: ItemStatus;
    isTransload: boolean;
    createdAt: string;
  }[];
  partDetails: {
    id: string;
    partNumber: string;
    quantity: number;
    status: ItemStatus;
    requestId: string;
    trailerId: string;
    createdAt: string;
    updatedAt: string;
  }[];
  logs: {
    id: string;
    action: string;
    timestamp: string;
    performer: {
      name: string;
      role: string;
    };
  }[];
}

interface RequestListProps {
  requests: Request[];
  showActions?: boolean;
}

import { BulkActionBar } from "./bulk-action-bar";

type SortField =
  | "shipmentNumber"
  | "plant"
  | "palletCount"
  | "status"
  | "createdAt";
type SortDirection = "asc" | "desc";

export default function RequestList({
  requests: initialRequests = [],
  showActions = true,
}: RequestListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [requests, setRequests] = useState<Request[]>(initialRequests);

  // Update local state when prop changes
  useEffect(() => {
    setRequests(initialRequests);
  }, [initialRequests]);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "ALL">(
    () => (searchParams.get("status") as RequestStatus | "ALL") || "ALL"
  );
  const [plantFilter, setPlantFilter] = useState(
    () => searchParams.get("plant") || "all"
  );
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("search") || ""
  );
  const [dateRange, setDateRange] = useState(() => ({
    start: searchParams.get("dateStart") || "",
    end: searchParams.get("dateEnd") || "",
  }));
  const [hideCompleted, setHideCompleted] = useState(
    () => searchParams.get("hideCompleted") === "true"
  );

  // Sort states
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get unique plants for filter dropdown
  const uniquePlants = useMemo(() => {
    const plants = new Set(
      requests
        .map((r) => r.plant)
        .filter((plant): plant is string => plant !== null)
    );
    return Array.from(plants).sort();
  }, [requests]);

  // Filter and sort requests
  const filteredAndSortedRequests = useMemo(() => {
    return requests
      .filter((request) => {
        // Hide completed/cancelled/rejected if toggle is on
        if (hideCompleted) {
          if (["COMPLETED", "CANCELLED", "REJECTED"].includes(request.status)) {
            return false;
          }
        }

        const matchesStatus =
          statusFilter === "ALL" || request.status === statusFilter;
        const matchesPlant =
          plantFilter === "all" || request.plant === plantFilter;
        const matchesSearch =
          !searchQuery ||
          request.shipmentNumber
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          request.creator.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          request.routeInfo?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDateRange =
          (!dateRange.start ||
            new Date(request.createdAt) >= new Date(dateRange.start)) &&
          (!dateRange.end ||
            new Date(request.createdAt) <= new Date(dateRange.end));

        return (
          matchesStatus && matchesPlant && matchesSearch && matchesDateRange
        );
      })
      .sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
          case "shipmentNumber":
            comparison = a.shipmentNumber.localeCompare(b.shipmentNumber);
            break;
          case "plant":
            comparison = (a.plant || "").localeCompare(b.plant || "");
            break;
          case "palletCount":
            comparison = a.palletCount - b.palletCount;
            break;
          case "status":
            comparison = a.status.localeCompare(b.status);
            break;
          case "createdAt":
            comparison =
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
        }
        return sortDirection === "asc" ? comparison : -comparison;
      });
  }, [
    requests,
    statusFilter,
    plantFilter,
    searchQuery,
    dateRange,
    sortField,
    sortDirection,
    hideCompleted,
  ]);

  // Auto-refresh functionality with shorter interval and data fetching
  useEffect(() => {
    const fetchAndUpdateRequests = async () => {
      try {
        const response = await fetch("/api/requests");
        if (!response.ok) throw new Error("Failed to fetch requests");
        const data = await response.json();
        setRequests(data);
      } catch (error) {
        // Silent fail - error shown to user via UI
      }
    };

    // Initial fetch
    fetchAndUpdateRequests();

    // Set up interval for periodic refresh
    const intervalId = setInterval(() => {
      fetchAndUpdateRequests();
    }, 5 * 1000); // Refresh every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  if (!user) {
    return null;
  }

  // Update URL with current filters
  const updateUrlParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (
          value === null ||
          value === "" ||
          value === "ALL" ||
          value === "all"
        ) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Construct new URL with updated params
      const newUrl = params.toString()
        ? `?${params.toString()}`
        : window.location.pathname;
      router.replace(newUrl, { scroll: false });
    },
    [searchParams, router]
  );

  // Update URL when filters change
  useEffect(() => {
    updateUrlParams({
      status: statusFilter,
      plant: plantFilter,
      search: searchQuery,
      dateStart: dateRange.start,
      dateEnd: dateRange.end,
      hideCompleted: hideCompleted ? "true" : null,
    });
  }, [
    statusFilter,
    plantFilter,
    searchQuery,
    dateRange,
    hideCompleted,
    updateUrlParams,
  ]);

  const clearFilters = () => {
    setStatusFilter("ALL");
    setPlantFilter("all");
    setSearchQuery("");
    setDateRange({ start: "", end: "" });
    setHideCompleted(false);
    // Clear URL params
    router.replace(window.location.pathname, { scroll: false });
  };

  const handleBulkStatusChange = (newStatus: RequestStatus) => {
    // Optimistically update UI
    setRequests((prevRequests) =>
      prevRequests.map((req) =>
        selectedRequests.includes(req.id) ? { ...req, status: newStatus } : req
      )
    );
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

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

  const getStatusBadgeColor = (status: RequestStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500";
      case "REPORTING":
        return "bg-cyan-500";
      case "APPROVED":
        return "bg-emerald-500";
      case "REJECTED":
        return "bg-red-500";
      case "IN_PROGRESS":
        return "bg-blue-500";
      case "LOADING":
        return "bg-indigo-500";
      case "IN_TRANSIT":
        return "bg-purple-500";
      case "ARRIVED":
        return "bg-teal-500";
      case "COMPLETED":
        return "bg-green-500";
      case "ON_HOLD":
        return "bg-orange-500";
      case "CANCELLED":
        return "bg-slate-500";
      case "FAILED":
        return "bg-rose-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const renderMobileCard = (request: Request) => (
    <Card key={request.id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          {showActions && user?.role === "ADMIN" && (
            <Checkbox
              checked={selectedRequests.includes(request.id)}
              onCheckedChange={(checked) => {
                setSelectedRequests(
                  checked
                    ? [...selectedRequests, request.id]
                    : selectedRequests.filter((id) => id !== request.id)
                );
              }}
              className="mt-1"
            />
          )}
          <Link
            href={`/requests/${request.id}`}
            className="text-blue-500 hover:underline"
          >
            <CardTitle>{request.shipmentNumber}</CardTitle>
          </Link>
          <Badge className={getStatusBadgeColor(request.status)}>
            {request.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-medium">Plant:</span>
            <div>{request.plant || "-"}</div>
          </div>
          <div>
            <span className="font-medium">Pallet Count:</span>
            <div>{request.palletCount}</div>
          </div>
          <div>
            <span className="font-medium">Transload Count:</span>
            <div>
              {Object.values(
                (request.trailers || [])
                  .filter((t) => t.isTransload)
                  .reduce((acc, trailer) => {
                    const date = trailer.createdAt.split("T")[0];
                    if (!acc[date]) {
                      acc[date] = new Set();
                    }
                    acc[date].add(trailer.trailer.trailerNumber);
                    return acc;
                  }, {} as { [date: string]: Set<string> })
              ).reduce((sum, uniqueTrailers) => sum + uniqueTrailers.size, 0)}
            </div>
          </div>
        </div>
        <div>
          <span className="font-medium">Route Info:</span>
          <div>{request.routeInfo || "-"}</div>
        </div>
        <div>
          <span className="font-medium">Created By:</span>
          <div>
            {request.creator.name}
            <span className="text-muted-foreground">
              {" "}
              ({request.creator.role})
            </span>
          </div>
        </div>
        <div>
          <span className="font-medium">Created At:</span>
          <div>{new Date(request.createdAt).toLocaleString()}</div>
        </div>
      </CardContent>
      {showActions && user?.role === "ADMIN" && (
        <CardFooter>
          {request.deleted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUndelete(request.id)}
              disabled={deleting === request.id}
              className="w-full"
            >
              {deleting === request.id ? "Restoring..." : "Restore"}
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(request.id)}
              disabled={deleting === request.id}
              className="w-full"
            >
              {deleting === request.id ? "Deleting..." : "Delete"}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );

  // Calculate pagination values
  const totalPages = Math.ceil(filteredAndSortedRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredAndSortedRequests.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, plantFilter, searchQuery, dateRange, hideCompleted]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the list when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
              className="w-8"
            >
              {page}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search shipment, route, or creator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as RequestStatus | "ALL")
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {Object.values(RequestStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={plantFilter} onValueChange={setPlantFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Plant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plants</SelectItem>
              {uniquePlants.map((plant) => (
                <SelectItem key={plant} value={plant}>
                  {plant}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="w-full"
            />
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="w-full"
            />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <StatusToggle
            onToggle={setHideCompleted}
            initialHideCompleted={false}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="text-sm"
            >
              Clear Filters
            </Button>
            {["ADMIN", "REPORT_RUNNER", "WAREHOUSE"].includes(user?.role) && (
              <>
                <Button
                  variant="outline"
                  onClick={downloadAsCSV}
                  className="text-sm"
                >
                  Download CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadTransloadCSV}
                  className="text-sm"
                >
                  Download Transloads
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {filteredAndSortedRequests.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-md">
          No requests found
        </div>
      ) : (
        <>
          {/* Mobile View (Cards) */}
          <div className="md:hidden space-y-4">
            {paginatedRequests.map(renderMobileCard)}
            {renderPagination()}
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {showActions && user?.role === "ADMIN" && (
                    <TableHead className="w-[30px] pr-0">
                      <Checkbox
                        checked={
                          selectedRequests.length === paginatedRequests.length
                        }
                        onCheckedChange={(checked) => {
                          setSelectedRequests(
                            checked
                              ? paginatedRequests.map((request) => request.id)
                              : []
                          );
                        }}
                      />
                    </TableHead>
                  )}
                  <TableHead
                    onClick={() => handleSort("shipmentNumber")}
                    className="cursor-pointer"
                  >
                    Shipment Number {getSortIcon("shipmentNumber")}
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("plant")}
                    className="cursor-pointer"
                  >
                    Plant {getSortIcon("plant")}
                  </TableHead>
                  <TableHead>Route Info</TableHead>
                  <TableHead>Transload Count</TableHead>
                  <TableHead
                    onClick={() => handleSort("palletCount")}
                    className="cursor-pointer"
                  >
                    Pallet Count {getSortIcon("palletCount")}
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("status")}
                    className="cursor-pointer"
                  >
                    Status {getSortIcon("status")}
                  </TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead
                    onClick={() => handleSort("createdAt")}
                    className="cursor-pointer"
                  >
                    Created At {getSortIcon("createdAt")}
                  </TableHead>
                  {showActions && user?.role === "ADMIN" && (
                    <TableHead>Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRequests.map((request) => (
                  <TableRow
                    key={request.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors duration-150"
                  >
                    {showActions && user?.role === "ADMIN" && (
                      <TableCell className="pr-0">
                        <Checkbox
                          checked={selectedRequests.includes(request.id)}
                          onCheckedChange={(checked) => {
                            setSelectedRequests(
                              checked
                                ? [...selectedRequests, request.id]
                                : selectedRequests.filter(
                                    (id) => id !== request.id
                                  )
                            );
                          }}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <Link
                        href={`/requests/${request.id}`}
                        className="text-blue-500 hover:underline"
                      >
                        {request.shipmentNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{request.plant || "-"}</TableCell>
                    <TableCell>{request.routeInfo || "-"}</TableCell>
                    <TableCell>
                      {Object.values(
                        (request.trailers || [])
                          .filter((t) => t.isTransload)
                          .reduce((acc, trailer) => {
                            const date = trailer.createdAt.split("T")[0];
                            if (!acc[date]) {
                              acc[date] = new Set();
                            }
                            acc[date].add(trailer.trailer.trailerNumber);
                            return acc;
                          }, {} as { [date: string]: Set<string> })
                      ).reduce(
                        (sum, uniqueTrailers) => sum + uniqueTrailers.size,
                        0
                      )}
                    </TableCell>
                    <TableCell>{request.palletCount}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(request.status)}>
                        {request.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.creator.name}
                      <br />
                      <span className="text-sm text-muted-foreground">
                        {request.creator.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toISOString().split("T")[0]}
                    </TableCell>
                    {showActions && user?.role === "ADMIN" && (
                      <TableCell>
                        {request.deleted ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUndelete(request.id)}
                            disabled={deleting === request.id}
                          >
                            {deleting === request.id
                              ? "Restoring..."
                              : "Restore"}
                          </Button>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(request.id)}
                            disabled={deleting === request.id}
                          >
                            {deleting === request.id ? "Deleting..." : "Delete"}
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {renderPagination()}
          </div>
        </>
      )}
      {showActions && user?.role === "ADMIN" && selectedRequests.length > 0 && (
        <BulkActionBar
          selectedRequests={selectedRequests}
          onStatusChange={handleBulkStatusChange}
          onClearSelection={() => setSelectedRequests([])}
        />
      )}
    </div>
  );
}
