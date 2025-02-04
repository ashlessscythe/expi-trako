import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusCardProps } from "./types";
import { getStatusBadgeColor } from "./types";

export function StatusCard({ status, deleted, routeInfo }: StatusCardProps) {
  return (
    <Card className="lg:h-fit">
      <CardHeader>
        <CardTitle>Status Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 items-center justify-between">
          <div className="flex gap-2 items-center">
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge className={getStatusBadgeColor(status)}>
                {status.replace("_", " ")}
              </Badge>
            </div>
            {deleted && <Badge variant="destructive">Deleted</Badge>}
          </div>
        </div>
        {routeInfo && (
          <div>
            <div className="text-sm text-muted-foreground">Route Info</div>
            <div className="font-medium">{routeInfo}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
