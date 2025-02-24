"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SystemSettings {
  costPerPallet: number;
  enableCostCalculation: boolean;
}

export function CostSettingsCard() {
  const [settings, setSettings] = useState<SystemSettings>({
    costPerPallet: 0,
    enableCostCalculation: false,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch settings on mount
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
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const handleSave = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            key: "costPerPallet",
            value: settings.costPerPallet.toString(),
            type: "number",
          },
          {
            key: "enableCostCalculation",
            value: settings.enableCostCalculation.toString(),
            type: "boolean",
          },
        ]),
      });

      if (!response.ok) throw new Error("Failed to save settings");

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enableCostCalculation">
              Enable Cost Calculation
            </Label>
            <Switch
              id="enableCostCalculation"
              checked={settings.enableCostCalculation}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  enableCostCalculation: checked,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="costPerPallet">Cost Per Pallet</Label>
            <Input
              id="costPerPallet"
              type="number"
              min="0"
              step="0.01"
              value={settings.costPerPallet}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  costPerPallet: Number(e.target.value),
                }))
              }
              disabled={!settings.enableCostCalculation}
            />
          </div>
        </div>

        <Button onClick={handleSave}>Save Settings</Button>
      </CardContent>
    </Card>
  );
}
