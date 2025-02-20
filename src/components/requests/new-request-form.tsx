"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { RequestStatus, Role, Site } from "@prisma/client";
import type { FormData } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TrailerInput {
  trailerNumber: string;
  isTransload: boolean;
  partsInput: string;
  parts: Array<{
    partNumber: string;
    quantity: number;
  }>;
}

interface NewRequestFormProps {
  userRole: Role;
  userId: string;
}

export default function NewRequestForm({
  userRole,
  userId,
}: NewRequestFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [trailerInputs, setTrailerInputs] = useState<TrailerInput[]>([
    {
      trailerNumber: "",
      isTransload: false,
      partsInput: "",
      parts: [],
    },
  ]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData & { siteId?: string }>({
    shipmentNumber: "",
    plant: "",
    trailers: [],
    palletCount: 1,
    routeInfo: "",
    additionalNotes: "",
    status:
      userRole === "WAREHOUSE"
        ? RequestStatus.REPORTING
        : RequestStatus.PENDING,
  });

  useEffect(() => {
    const fetchUserSites = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch user sites");
        const userData = await response.json();

        // Combine sites from both old and new relationships
        const userSites = [
          ...(userData.userSites?.map((us: any) => us.site) || []),
          ...(userData.site ? [userData.site] : []),
        ];

        // Remove duplicates based on site id
        const uniqueSites = Array.from(
          new Map(userSites.map((site) => [site.id, site])).values()
        );

        setSites(uniqueSites);

        // If user has only one site, set it as default
        if (uniqueSites.length === 1) {
          setFormData((prev) => ({ ...prev, siteId: uniqueSites[0].id }));
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch user sites:", error);
        toast({
          title: "Error",
          description: "Failed to load sites",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchUserSites();
  }, [userId, toast]);

  const parsePartsInput = (input: string) => {
    return input
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const [partNumber, quantityStr] = line
          .split(/[,\t]/)
          .map((s) => s.trim());
        const quantity = parseInt(quantityStr) || 1;
        if (!partNumber) {
          throw new Error("Each line must contain a part number");
        }
        return { partNumber, quantity };
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate plant number if provided
      if (formData.plant && !/^[a-zA-Z0-9]{4}$/.test(formData.plant)) {
        throw new Error("Plant must be exactly 4 alphanumeric characters");
      }

      // Process each trailer's parts
      const processedTrailers = trailerInputs.map((trailer) => {
        if (!trailer.trailerNumber) {
          throw new Error("All trailer numbers are required");
        }

        const parts = parsePartsInput(trailer.partsInput);
        if (parts.length === 0) {
          throw new Error(
            `Trailer ${trailer.trailerNumber} must have at least one part number`
          );
        }

        return {
          trailerNumber: trailer.trailerNumber,
          isTransload: trailer.isTransload,
          parts,
        };
      });

      // Validate site selection if user has multiple sites
      if (sites.length > 1 && !formData.siteId) {
        throw new Error("Please select a site for this request");
      }

      const requestData = {
        ...formData,
        trailers: processedTrailers,
        siteId: formData.siteId,
      };

      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create request");
      }

      toast({
        title: "Success",
        description: "Request created successfully",
      });

      // First navigate to /requests
      router.push("/requests");
      // Then refresh to ensure the list updates
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create request",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "palletCount" ? parseInt(value) || 1 : value,
    }));
  };

  const handleTrailerChange = (
    index: number,
    field: keyof TrailerInput,
    value: string | boolean
  ) => {
    setTrailerInputs((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  const addTrailer = () => {
    setTrailerInputs((prev) => [
      ...prev,
      {
        trailerNumber: "",
        isTransload: false,
        partsInput: "",
        parts: [],
      },
    ]);
  };

  const removeTrailer = (index: number) => {
    if (trailerInputs.length > 1) {
      setTrailerInputs((prev) => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {sites.length > 1 && (
        <div className="space-y-2">
          <Label htmlFor="site">Site *</Label>
          <Select
            value={formData.siteId}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, siteId: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a site" />
            </SelectTrigger>
            <SelectContent>
              {sites.map((site) => (
                <SelectItem key={site.id} value={site.id}>
                  {site.name} ({site.locationCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="shipmentNumber">Shipment Number *</Label>
        <Input
          id="shipmentNumber"
          name="shipmentNumber"
          value={formData.shipmentNumber}
          onChange={handleChange}
          required
          placeholder="Enter shipment number"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="plant">Plant (4 characters)</Label>
        <Input
          id="plant"
          name="plant"
          value={formData.plant || ""}
          onChange={handleChange}
          placeholder="Enter 4-character plant code"
          pattern="[a-zA-Z0-9]{4}"
          title="Plant code must be exactly 4 alphanumeric characters"
          maxLength={4}
        />
      </div>

      {trailerInputs.map((trailer, index) => (
        <div key={index} className="space-y-4 p-4 border rounded-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Trailer {index + 1}</h3>
            {trailerInputs.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => removeTrailer(index)}
                size="sm"
              >
                Remove Trailer
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`trailer-${index}`}>Trailer Number *</Label>
              <Input
                id={`trailer-${index}`}
                value={trailer.trailerNumber}
                onChange={(e) =>
                  handleTrailerChange(index, "trailerNumber", e.target.value)
                }
                required
                placeholder="Enter trailer number"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`isTransload-${index}`}
                checked={trailer.isTransload}
                onChange={(e) =>
                  handleTrailerChange(index, "isTransload", e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor={`isTransload-${index}`}>Is Transload</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`parts-${index}`}>
              Part Numbers and Quantities *
            </Label>
            <Textarea
              id={`parts-${index}`}
              value={trailer.partsInput}
              onChange={(e) =>
                handleTrailerChange(index, "partsInput", e.target.value)
              }
              required
              placeholder="Enter part numbers and quantities (one per line, separated by comma or tab)&#10;Example:&#10;35834569, 6&#10;35834578, 12"
              rows={5}
            />
            <p className="text-sm text-muted-foreground">
              Format: Part Number, Quantity (one per line)
            </p>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addTrailer}
        className="w-full"
      >
        Add Another Trailer
      </Button>

      <div className="space-y-2">
        <Label htmlFor="palletCount">Pallet Count *</Label>
        <Input
          id="palletCount"
          name="palletCount"
          type="number"
          min="1"
          value={formData.palletCount}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="routeInfo">Route Information</Label>
        <Input
          id="routeInfo"
          name="routeInfo"
          value={formData.routeInfo || ""}
          onChange={handleChange}
          placeholder="Enter route information"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalNotes">Additional Notes</Label>
        <Textarea
          id="additionalNotes"
          name="additionalNotes"
          value={formData.additionalNotes || ""}
          onChange={handleChange}
          placeholder="Enter any additional notes"
          rows={4}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Creating..." : "Create Request"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
