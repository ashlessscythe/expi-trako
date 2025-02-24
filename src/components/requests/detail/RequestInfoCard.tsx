import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RequestInfoCardProps } from "./types";
import { useEffect, useState } from "react";

interface Settings {
  costPerPallet: number;
  enableCostCalculation: boolean;
}

export function RequestInfoCard({
  request,
  canUpdateStatus,
  onEditStatus,
}: RequestInfoCardProps) {
  const [settings, setSettings] = useState<Settings>({
    costPerPallet: 0,
    enableCostCalculation: false,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        if (!response.ok) throw new Error("Failed to fetch settings");
        const data = await response.json();

        setSettings({
          costPerPallet: Number(
            data.find((s: any) => s.key === "costPerPallet")?.value || 0
          ),
          enableCostCalculation:
            data.find((s: any) => s.key === "enableCostCalculation")?.value ===
            "true",
        });
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    fetchSettings();
  }, []);

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
          <div className="font-medium">
            {request.palletCount}
            {settings.enableCostCalculation && settings.costPerPallet > 0 && (
              <div className="text-sm text-muted-foreground mt-1">
                Cost: $
                {(request.palletCount * settings.costPerPallet).toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
