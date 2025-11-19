import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { PartsTrailerGridProps } from "./types";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const statusVariantMap: Record<string, BadgeVariant> = {
  PENDING: "pending",
  REPORTING: "reporting",
  APPROVED: "approved",
  REJECTED: "rejected",
  COMPLETED: "completed",
  IN_PROGRESS: "in_progress",
  INTRANSIT: "in_transit",
  IN_TRANSIT: "in_transit",
  LOADING: "in_progress",
  ARRIVED: "completed",
  CANCELED: "canceled",
  CANCELLED: "canceled",
  ON_HOLD: "on_hold",
  FAILED: "destructive",
};

const getStatusVariant = (status?: string | null): BadgeVariant => {
  if (!status) {
    return "pending";
  }
  return statusVariantMap[status] || "default";
};

export function PartsTrailerGrid({
  partsByTrailer,
  trailers,
  partDetails,
}: PartsTrailerGridProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Parts by Trailer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-2">
          {Object.entries(partsByTrailer).map(
            ([trailerNumber, { isTransload, parts }]) => (
              <Card key={trailerNumber}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    Trailer: {trailerNumber}
                    {isTransload && (
                      <Badge variant="secondary">Transload</Badge>
                    )}
                    <Badge
                      variant={getStatusVariant(
                        trailers.find(
                          (t) => t.trailer.trailerNumber === trailerNumber
                        )?.status
                      )}
                    >
                      {trailers
                        .find((t) => t.trailer.trailerNumber === trailerNumber)
                        ?.status.replace("_", " ") || "PENDING"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {parts.map((part, index) => (
                      <div
                        key={index}
                        className="bg-muted px-2 py-1 rounded flex justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span>{part.partNumber}</span>
                          <Badge
                            variant={getStatusVariant(
                              partDetails.find(
                                (p) => p.partNumber === part.partNumber
                              )?.status
                            )}
                          >
                            {partDetails
                              .find((p) => p.partNumber === part.partNumber)
                              ?.status.replace("_", " ") || "PENDING"}
                          </Badge>
                        </div>
                        <span className="text-muted-foreground">
                          Qty: {part.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
