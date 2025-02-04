import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ItemStatus } from "@prisma/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface StatusEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  trailers: Array<{
    id: string;
    trailer: { trailerNumber: string };
    status: ItemStatus;
    isTransload: boolean;
  }>;
  parts: Array<{
    id: string;
    partNumber: string;
    status: ItemStatus;
    trailer: { trailerNumber: string };
  }>;
  onSuccess: () => void;
}

export default function StatusEditModal({
  isOpen,
  onClose,
  requestId,
  trailers,
  parts,
  onSuccess,
}: StatusEditModalProps) {
  const { toast } = useToast();
  const [trailerStatuses, setTrailerStatuses] = useState<
    Record<string, ItemStatus>
  >(
    trailers.reduce(
      (acc, trailer) => ({
        ...acc,
        [trailer.id]: trailer.status,
      }),
      {}
    )
  );
  const [trailerTransloads, setTrailerTransloads] = useState<
    Record<string, boolean>
  >(
    trailers.reduce(
      (acc, trailer) => ({
        ...acc,
        [trailer.id]: trailer.isTransload || false,
      }),
      {}
    )
  );
  const [partStatuses, setPartStatuses] = useState<Record<string, ItemStatus>>(
    parts.reduce(
      (acc, part) => ({
        ...acc,
        [part.id]: part.status,
      }),
      {}
    )
  );
  const [updating, setUpdating] = useState(false);

  const handleSave = async () => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/requests/${requestId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          trailerStatuses,
          partStatuses,
          trailerTransloads,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update statuses");
      }

      toast({
        title: "Success",
        description: "Item statuses updated successfully",
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update statuses",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Item Statuses</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Trailers</h3>
            {trailers.map((trailer) => (
              <div key={trailer.id} className="flex items-center gap-4">
                <div className="flex flex-col min-w-[200px] gap-2">
                  <span>Trailer: {trailer.trailer.trailerNumber}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={trailerTransloads[trailer.id]}
                      onChange={(e) =>
                        setTrailerTransloads((prev) => ({
                          ...prev,
                          [trailer.id]: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 border-gray-300 rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm">
                      Is this a transload trailer?
                    </span>
                  </div>
                </div>
                <Select
                  value={trailerStatuses[trailer.id]}
                  onValueChange={(value: ItemStatus) =>
                    setTrailerStatuses((prev) => ({
                      ...prev,
                      [trailer.id]: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ItemStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Parts</h3>
            {parts.map((part) => (
              <div key={part.id} className="flex items-center gap-4">
                <span className="min-w-[200px]">
                  {part.partNumber} (Trailer: {part.trailer.trailerNumber})
                </span>
                <Select
                  value={partStatuses[part.id]}
                  onValueChange={(value: ItemStatus) =>
                    setPartStatuses((prev) => ({
                      ...prev,
                      [part.id]: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ItemStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updating}>
              {updating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
