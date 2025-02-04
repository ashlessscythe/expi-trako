import { Button } from "@/components/ui/button";
import { RequestDetailHeaderProps } from "./types";

export function RequestDetailHeader({
  canEdit,
  onEdit,
  onBack,
}: RequestDetailHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Request Details</h1>
      <div className="space-x-2">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        {canEdit && <Button onClick={onEdit}>Edit Request</Button>}
      </div>
    </div>
  );
}
