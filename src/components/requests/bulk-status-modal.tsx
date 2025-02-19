import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BulkStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestCount: number;
  onConfirm: (sendEmail: boolean) => void;
}

export function BulkStatusModal({
  isOpen,
  onClose,
  requestCount,
  onConfirm,
}: BulkStatusModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Requests</DialogTitle>
          <DialogDescription>
            You are about to mark {requestCount} requests as complete.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:justify-end">
            <Button variant="outline" onClick={onClose} className="sm:w-auto">
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => onConfirm(false)}
              className="sm:w-auto"
            >
              Mark Complete Only
            </Button>
            <Button
              variant="default"
              onClick={() => onConfirm(true)}
              className="sm:w-auto"
            >
              Mark Complete & Send Email
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
