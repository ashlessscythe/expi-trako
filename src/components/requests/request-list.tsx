"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { RequestStatus } from "@prisma/client";
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
  palletCount: number;
  status: RequestStatus;
  creator: RequestCreator;
  createdAt: string;
  deleted: boolean;
}

interface RequestListProps {
  requests: Request[];
  showActions?: boolean;
}

type SortField =
  | "shipmentNumber"
  | "plant"
  | "palletCount"
  | "status"
  | "createdAt";
type SortDirection = "asc" | "desc";

export default function RequestList({
  requests = [],
  showActions = true,
}: RequestListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [deleting, setDeleting] = useState<string | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "ALL">(
    "ALL"
  );
  const [plantFilter, setPlantFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Sort states
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

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
            .includes(searchQuery.toLowerCase());
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
  ]);

  // Auto-refresh functionality
  useEffect(() => {
    router.refresh();
    const intervalId = setInterval(() => {
      router.refresh();
    }, 30000);
    return () => clearInterval(intervalId);
  }, [router]);

  if (!user) {
    return null;
  }

  const clearFilters = () => {
    setStatusFilter("ALL");
    setPlantFilter("all");
    setSearchQuery("");
    setDateRange({ start: "", end: "" });
  };

  const downloadAsCSV = () => {
    // Convert filtered requests to CSV format
    const headers = [
      "Shipment Number",
      "Plant",
      "Route Info",
      "Pallet Count",
      "Status",
      "Created By",
      "Creator Role",
      "Created At",
    ];

    const csvData = filteredAndSortedRequests.map((request) => [
      request.shipmentNumber,
      request.plant || "",
      request.routeInfo || "",
      request.palletCount.toString(),
      request.status,
      request.creator.name,
      request.creator.role,
      new Date(request.createdAt).toLocaleString(),
    ]);

    // Add headers as first row
    csvData.unshift(headers);

    // Convert to CSV string
    const csvString = csvData
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

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search shipment or creator..."
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
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={clearFilters} className="text-sm">
            Clear Filters
          </Button>
          {(user?.role === "ADMIN" || user?.role === "REPORT_RUNNER") && (
            <Button
              variant="outline"
              onClick={downloadAsCSV}
              className="text-sm"
            >
              Download CSV
            </Button>
          )}
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
            {filteredAndSortedRequests.map(renderMobileCard)}
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
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
                {filteredAndSortedRequests.map((request) => (
                  <TableRow
                    key={request.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors duration-150"
                  >
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
                      {new Date(request.createdAt).toLocaleString()}
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
          </div>
        </>
      )}
    </div>
  );
}
