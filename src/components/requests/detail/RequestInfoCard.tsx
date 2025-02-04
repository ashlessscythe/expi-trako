import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RequestInfoCardProps } from "./types";

export function RequestInfoCard({
  request,
  canUpdateStatus,
  onEditStatus,
}: RequestInfoCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Request Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-x-8">
        <div>
          <div className="text-sm text-muted-foreground">Shipment Number</div>
          <div className="font-medium">{request.shipmentNumber}</div>
        </div>
        {request.plant && (
          <div>
            <div className="text-sm text-muted-foreground">Plant</div>
            <div className="font-medium">{request.plant}</div>
          </div>
        )}
        {request.authorizationNumber && (
          <div>
            <div className="text-sm text-muted-foreground">
              Authorization Number
            </div>
            <div className="font-medium">{request.authorizationNumber}</div>
          </div>
        )}
        <div>
          {canUpdateStatus && (
            <Button variant="default" onClick={onEditStatus}>
              Edit Status
            </Button>
          )}
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Pallet Count</div>
          <div className="font-medium">{request.palletCount}</div>
        </div>
      </CardContent>
    </Card>
  );
}
