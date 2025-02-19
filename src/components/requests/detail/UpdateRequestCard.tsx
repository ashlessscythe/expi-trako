"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RequestStatus } from "@prisma/client";
import { useState } from "react";
import { UpdateRequestCardProps } from "./types";

export function UpdateRequestCard({
  currentStatus,
  onUpdate,
  updating,
}: UpdateRequestCardProps) {
  const [newStatus, setNewStatus] = useState<RequestStatus | "">(currentStatus);
  const [note, setNote] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{
    status: RequestStatus;
    note: string;
  } | null>(null);
  const [forceCompleting, setForceCompleting] = useState(false);

  const handleUpdate = async (forceComplete?: boolean) => {
    if (!note && !newStatus) return;
    if (newStatus === currentStatus && !note) return;

    try {
      const result = await onUpdate(
        newStatus as RequestStatus,
        note,
        forceComplete
      );
      if (result?.requiresConfirmation) {
        setPendingUpdate({
          status: newStatus as RequestStatus,
          note,
        });
        setShowConfirmation(true);
        return;
      }
      setNote("");
      setPendingUpdate(null);
      setShowConfirmation(false);
    } catch (error) {
      // Let the parent component handle other errors
      throw error;
    }
  };

  const handleConfirmUpdate = async () => {
    if (pendingUpdate) {
      try {
        setForceCompleting(true);
        await handleUpdate(true);
      } catch (error) {
        setForceCompleting(false);
        throw error;
      }
    }
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Update Request</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Status</div>
          <Select
            value={newStatus}
            onValueChange={(value: string) =>
              setNewStatus(value as RequestStatus)
            }
          >
            <SelectTrigger className="bg-background text-foreground border border-border shadow-sm rounted-md">
              <SelectValue placeholder="Select new status" />
            </SelectTrigger>
            <SelectContent className="bg-background text-foreground border border-border shadow-sm rounted-md">
              {Object.values(RequestStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 lg:col-span-2">
          <div className="text-sm text-muted-foreground">Add Note</div>
          <Textarea
            placeholder="Add a note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
          />
        </div>

        <Button
          onClick={() => handleUpdate()}
          disabled={
            updating || (!note && (!newStatus || newStatus === currentStatus))
          }
          className="w-full lg:col-span-2"
        >
          {updating ? "Updating..." : "Update Request"}
        </Button>
      </CardContent>
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Force Complete?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Not all items are marked as completed. Do you want to force
              complete this request anyway?
            </p>
          </div>
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                setShowConfirmation(false);
                setNewStatus(currentStatus);
                setPendingUpdate(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleConfirmUpdate();
              }}
              disabled={forceCompleting}
            >
              Force Complete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
