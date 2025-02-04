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

  const handleUpdate = async () => {
    if (!note && !newStatus) return;
    if (newStatus === currentStatus && !note) return;

    await onUpdate(newStatus as RequestStatus, note);
    setNote("");
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
          onClick={handleUpdate}
          disabled={
            updating || (!note && (!newStatus || newStatus === currentStatus))
          }
          className="w-full lg:col-span-2"
        >
          {updating ? "Updating..." : "Update Request"}
        </Button>
      </CardContent>
    </Card>
  );
}
