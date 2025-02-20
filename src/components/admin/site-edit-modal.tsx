"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Site {
  id: string;
  name: string;
  locationCode: string;
}

interface SiteEditModalProps {
  site: Site | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SiteEditModal({ site, open, onOpenChange, onSuccess }: SiteEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(site?.name || "");
  const [locationCode, setLocationCode] = useState(site?.locationCode || "");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/sites", {
        method: site ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: site?.id,
          name,
          locationCode,
        }),
      });

      if (!response.ok) throw new Error("Failed to save site");

      toast({
        title: "Success",
        description: `Site ${site ? "updated" : "created"} successfully`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${site ? "update" : "create"} site`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{site ? "Edit Site" : "Add Site"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter site name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="locationCode">Location Code</Label>
            <Input
              id="locationCode"
              value={locationCode}
              onChange={(e) => setLocationCode(e.target.value)}
              placeholder="Enter location code"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
