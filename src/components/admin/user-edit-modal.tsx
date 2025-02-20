"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { User } from "@/lib/types/user";
import { Site } from "@prisma/client";

interface UserEditModalProps {
  user: User;
  onUpdate: () => void;
}

export function UserEditModal({ user, onUpdate }: UserEditModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await fetch("/api/sites");
        if (!response.ok) throw new Error("Failed to fetch sites");
        const data = await response.json();
        setSites(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load sites",
          variant: "destructive",
        });
      }
    };

    fetchSites();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      siteId: (formData.get("siteId") as string) || null,
    };

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update user");

      toast({ title: "Success", description: "User updated successfully" });

      onUpdate();
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-muted rounded-full transition-all duration-200 p-2"
        >
          <Pencil className="h-4 w-4 text-primary group-hover:text-blue-600 transition" />
          <span className="sr-only">Edit user</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-lg shadow-xl transition-all transform scale-95 hover:scale-100 duration-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-primary">
            Edit User
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-muted-foreground">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={user.name}
              required
              className="focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={user.email}
              required
              className="focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site" className="text-muted-foreground">
              Site
            </Label>
            <Select name="siteId" defaultValue={user.siteId || "unassigned"}>
              <SelectTrigger>
                <SelectValue placeholder="Select a site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">No site assigned</SelectItem>
                {sites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name} ({site.locationCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-muted-foreground">
              Password (leave blank to keep unchanged)
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              className="focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="transition-all">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
