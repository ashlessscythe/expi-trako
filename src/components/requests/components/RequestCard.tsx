import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import type { Request } from "../types";
import { getStatusBadgeColor } from "../utils/status";

interface RequestCardProps {
  request: Request;
  showActions?: boolean;
  onDelete?: (id: string) => void;
  onUndelete?: (id: string) => void;
  deleting?: string | null;
  user?: { role: string } | null;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
}

export function RequestCard({
  request,
  showActions = true,
  onDelete,
  onUndelete,
  deleting,
  user,
  selected,
  onSelect,
}: RequestCardProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          {showActions && user?.role === "ADMIN" && onSelect && (
            <Checkbox
              checked={selected}
              onCheckedChange={(checked) => onSelect(request.id, !!checked)}
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
          <span className="font-medium">Site:</span>
          <div>{request.site?.name || "nosite"}</div>
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
              onClick={() => onUndelete?.(request.id)}
              disabled={deleting === request.id}
              className="w-full"
            >
              {deleting === request.id ? "Restoring..." : "Restore"}
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete?.(request.id)}
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
}
