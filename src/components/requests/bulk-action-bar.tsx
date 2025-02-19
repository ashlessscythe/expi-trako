import { useState, useCallback } from "react";
import { RequestStatus } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BulkStatusModal } from "./bulk-status-modal";

interface BulkActionBarProps {
  selectedRequests: string[];
  onStatusChange: (status: RequestStatus) => void;
  onClearSelection: () => void;
}

export function BulkActionBar({
  selectedRequests,
  onStatusChange,
  onClearSelection,
}: BulkActionBarProps) {
  const [updating, setUpdating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<RequestStatus | null>(
    null
  );
  const { toast } = useToast();

  const handleStatusConfirm = useCallback(
    async (status: RequestStatus, sendEmail: boolean) => {
      setShowModal(false);
      setUpdating(true);
      try {
        const response = await fetch("/api/requests/bulk-status", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestIds: selectedRequests,
            status,
            sendEmail,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update statuses");
        }

        toast({
          title: "Success",
          description: `Updated ${
            selectedRequests.length
          } requests to ${status.replace("_", " ")}`,
        });

        onStatusChange(status);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update request statuses",
          variant: "destructive",
        });
      } finally {
        setUpdating(false);
      }
    },
    [selectedRequests, toast, onStatusChange]
  );

  const handleStatusChange = useCallback(
    (status: RequestStatus) => {
      setPendingStatus(status);
      if (status === "COMPLETED") {
        setShowModal(true);
      } else {
        handleStatusConfirm(status, false);
      }
    },
    [handleStatusConfirm]
  );

  const handleModalConfirm = useCallback(
    (sendEmail: boolean) => {
      if (!pendingStatus) return;
      handleStatusConfirm(pendingStatus, sendEmail);
    },
    [pendingStatus, handleStatusConfirm]
  );

  return (
    <>
      <BulkStatusModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        requestCount={selectedRequests.length}
        onConfirm={handleModalConfirm}
      />
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-900 p-4 rounded-lg shadow-lg border flex items-center gap-4 z-50">
        <div className="text-sm font-medium">
          {selectedRequests.length} requests selected
        </div>
        <Select
          disabled={updating}
          onValueChange={(value) => handleStatusChange(value as RequestStatus)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Change status to..." />
          </SelectTrigger>
          <SelectContent>
            {Object.values(RequestStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearSelection}
          disabled={updating}
        >
          Clear Selection
        </Button>
      </div>
    </>
  );
}
