"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface PalletCountInputProps {
  shipmentNumber: string;
  defaultCount: number;
  value: number;
  onChange: (value: number) => void;
}

export function PalletCountInput({
  shipmentNumber,
  defaultCount,
  value,
  onChange,
}: PalletCountInputProps) {
  const [showWarning, setShowWarning] = useState(false);

  const handleChange = (newValue: number) => {
    setShowWarning(newValue > 20 && newValue <= 75);
    if (newValue > 75) return; // Don't allow values over 75
    onChange(newValue);
  };

  return (
    <div className="flex items-start gap-4 py-2">
      <div className="flex-1">
        <Label className="text-sm font-medium">
          Shipment: {shipmentNumber}
        </Label>
        <div className="text-sm text-muted-foreground">
          Default: {defaultCount} pallets
        </div>
      </div>
      <div className="w-32">
        <Input
          type="number"
          min={1}
          max={75}
          value={value}
          onChange={(e) => handleChange(parseInt(e.target.value) || 0)}
          className={showWarning ? "border-yellow-500" : ""}
        />
        {showWarning && (
          <div className="flex items-center gap-1 mt-1 text-xs text-yellow-600">
            <AlertCircle className="w-3 h-3" />
            High pallet count
          </div>
        )}
      </div>
    </div>
  );
}
