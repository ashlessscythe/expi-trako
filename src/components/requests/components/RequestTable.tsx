import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Request, SortField } from "../types";
import { getStatusBadgeColor } from "../utils/status";

interface RequestTableProps {
  requests: Request[];
  selectedRequests: string[];
  onSelectRequest: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  sortField: SortField;
  sortDirection: "asc" | "desc";
  onSort: (field: SortField) => void;
  showActions?: boolean;
  onDelete?: (id: string) => void;
  onUndelete?: (id: string) => void;
  deleting?: string | null;
  user?: { role: string } | null;
}

export function RequestTable({
  requests,
  selectedRequests,
  onSelectRequest,
  onSelectAll,
  sortField,
  sortDirection,
  onSort,
  showActions = true,
  onDelete,
  onUndelete,
  deleting,
  user,
}: RequestTableProps) {
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {showActions && user?.role === "ADMIN" && (
              <TableHead className="w-[30px] pr-0">
                <Checkbox
                  checked={selectedRequests.length === requests.length}
                  onCheckedChange={(checked) => onSelectAll(!!checked)}
                />
              </TableHead>
            )}
            <TableHead
              onClick={() => onSort("shipmentNumber")}
              className="cursor-pointer"
            >
              Shipment Number {getSortIcon("shipmentNumber")}
            </TableHead>
            <TableHead
              onClick={() => onSort("plant")}
              className="cursor-pointer"
            >
              Plant {getSortIcon("plant")}
            </TableHead>
            <TableHead>Route Info</TableHead>
            <TableHead>Transload Count</TableHead>
            <TableHead
              onClick={() => onSort("palletCount")}
              className="cursor-pointer"
            >
              Pallet Count {getSortIcon("palletCount")}
            </TableHead>
            <TableHead
              onClick={() => onSort("status")}
              className="cursor-pointer"
            >
              Status {getSortIcon("status")}
            </TableHead>
            <TableHead>Site</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead
              onClick={() => onSort("createdAt")}
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
          {requests.map((request) => (
            <TableRow
              key={request.id}
              className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors duration-150"
            >
              {showActions && user?.role === "ADMIN" && (
                <TableCell className="pr-0">
                  <Checkbox
                    checked={selectedRequests.includes(request.id)}
                    onCheckedChange={(checked) =>
                      onSelectRequest(request.id, !!checked)
                    }
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
                ).reduce((sum, uniqueTrailers) => sum + uniqueTrailers.size, 0)}
              </TableCell>
              <TableCell>{request.palletCount}</TableCell>
              <TableCell>
                <Badge className={getStatusBadgeColor(request.status)}>
                  {request.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>{request.site?.name || "nosite"}</TableCell>
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
                      onClick={() => onUndelete?.(request.id)}
                      disabled={deleting === request.id}
                    >
                      {deleting === request.id ? "Restoring..." : "Restore"}
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete?.(request.id)}
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
  );
}
