"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SiteEditModal } from "./site-edit-modal";
import { useToast } from "@/hooks/use-toast";

interface Site {
  id: string;
  name: string;
  locationCode: string;
}

export function SitesTable() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const response = await fetch("/api/sites");
      if (!response.ok) throw new Error("Failed to fetch sites");
      const data = await response.json();
      setSites(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch sites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch("/api/sites", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error("Failed to delete site");

      toast({
        title: "Success",
        description: "Site deleted successfully",
      });

      fetchSites();
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete site",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (site: Site) => {
    setEditingSite(site);
    setShowEditModal(true);
  };

  const handleCreate = () => {
    setEditingSite(null);
    setShowEditModal(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleCreate}>Add Site</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location Code</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sites.map((site) => (
            <TableRow key={site.id}>
              <TableCell>{site.name}</TableCell>
              <TableCell>{site.locationCode}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(site)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(site.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <SiteEditModal
        site={editingSite}
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onSuccess={() => {
          fetchSites();
          router.refresh();
        }}
      />
    </div>
  );
}
