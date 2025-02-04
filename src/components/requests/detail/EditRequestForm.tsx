"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { EditRequestFormProps } from "./types";
import { useState } from "react";
import type { FormData, FormTrailer } from "@/lib/types";

export function EditRequestForm({
  initialData,
  onSave,
  onCancel,
  updating,
}: EditRequestFormProps) {
  const { toast } = useToast();
  const [editForm, setEditForm] = useState<FormData>(initialData);

  const handlePartChange = (
    trailerIndex: number,
    partIndex: number,
    field: "partNumber" | "quantity",
    value: string
  ) => {
    const newTrailers = [...editForm.trailers];
    const newParts = [...newTrailers[trailerIndex].parts];
    if (field === "quantity") {
      newParts[partIndex] = {
        ...newParts[partIndex],
        [field]: parseInt(value) || 0,
      };
    } else {
      newParts[partIndex] = { ...newParts[partIndex], [field]: value };
    }
    newTrailers[trailerIndex] = {
      ...newTrailers[trailerIndex],
      parts: newParts,
    };
    setEditForm({ ...editForm, trailers: newTrailers });
  };

  const addPart = (trailerIndex: number) => {
    const newTrailers = [...editForm.trailers];
    newTrailers[trailerIndex].parts.push({ partNumber: "", quantity: 0 });
    setEditForm({ ...editForm, trailers: newTrailers });
  };

  const removePart = (trailerIndex: number, partIndex: number) => {
    const newTrailers = [...editForm.trailers];
    newTrailers[trailerIndex].parts = newTrailers[trailerIndex].parts.filter(
      (_, i) => i !== partIndex
    );
    setEditForm({ ...editForm, trailers: newTrailers });
  };

  const addTrailer = () => {
    toast({
      title: "Note",
      description:
        "Each trailer must have at least one part number with non-zero quantity",
    });
    setEditForm({
      ...editForm,
      trailers: [
        ...editForm.trailers,
        {
          trailerNumber: "",
          parts: [{ partNumber: "", quantity: 0 }],
        },
      ],
    });
  };

  const removeTrailer = (index: number) => {
    const newTrailers = editForm.trailers.filter((_, i) => i !== index);
    setEditForm({ ...editForm, trailers: newTrailers });
  };

  const handleTrailerNumberChange = (index: number, value: string) => {
    const newTrailers = [...editForm.trailers];
    newTrailers[index] = { ...newTrailers[index], trailerNumber: value };
    setEditForm({ ...editForm, trailers: newTrailers });
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!editForm.shipmentNumber) {
      toast({
        title: "Error",
        description: "Shipment number is required",
        variant: "destructive",
      });
      return;
    }

    if (!editForm.trailers.length) {
      toast({
        title: "Error",
        description: "At least one trailer is required",
        variant: "destructive",
      });
      return;
    }

    // Validate each trailer has at least one part with non-zero quantity
    const invalidTrailer = editForm.trailers.find(
      (trailer) =>
        !trailer.parts.length ||
        !trailer.parts.some((part) => part.partNumber && part.quantity > 0)
    );

    if (invalidTrailer) {
      toast({
        title: "Error",
        description:
          "Each trailer must have at least one part with a part number and quantity greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (editForm.palletCount <= 0) {
      toast({
        title: "Error",
        description: "Pallet count must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    // Validate plant format if provided
    if (editForm.plant && !/^[a-zA-Z0-9]{4}$/.test(editForm.plant)) {
      toast({
        title: "Error",
        description: "Plant must be exactly 4 alphanumeric characters",
        variant: "destructive",
      });
      return;
    }

    await onSave(editForm);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Edit Request</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updating}>
            {updating ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
          <div className="space-y-2">
            <Label>Shipment Number *</Label>
            <Input
              value={editForm.shipmentNumber}
              onChange={(e) =>
                setEditForm({ ...editForm, shipmentNumber: e.target.value })
              }
              required
              placeholder="Enter shipment number"
            />
          </div>

          <div className="space-y-2">
            <Label>Plant (4 characters)</Label>
            <Input
              value={editForm.plant || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, plant: e.target.value })
              }
              maxLength={4}
              pattern="[a-zA-Z0-9]{4}"
              title="Plant must be exactly 4 alphanumeric characters"
              placeholder="Enter 4-character plant code"
            />
          </div>

          <div className="space-y-2">
            <Label>Authorization Number</Label>
            <Input
              value={editForm.authorizationNumber || ""}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  authorizationNumber: e.target.value,
                })
              }
              placeholder="Enter authorization number"
            />
          </div>

          <div className="space-y-2">
            <Label>Pallet Count *</Label>
            <Input
              type="number"
              value={editForm.palletCount}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  palletCount: parseInt(e.target.value) || 0,
                })
              }
              required
              min="1"
              placeholder="Enter pallet count"
            />
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <Label>Trailers and Parts *</Label>
              <Button onClick={addTrailer} variant="outline" size="sm">
                Add Trailer
              </Button>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {editForm.trailers.map((trailer, trailerIndex) => (
                <Card key={trailerIndex}>
                  <CardHeader className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Trailer Number *</Label>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeTrailer(trailerIndex)}
                      >
                        Remove Trailer
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Input
                        value={trailer.trailerNumber}
                        onChange={(e) =>
                          handleTrailerNumberChange(
                            trailerIndex,
                            e.target.value
                          )
                        }
                        required
                        placeholder="Enter trailer number"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Parts *</Label>
                      <Button
                        onClick={() => addPart(trailerIndex)}
                        variant="outline"
                        size="sm"
                      >
                        Add Part
                      </Button>
                    </div>
                    {trailer.parts.map((part, partIndex) => (
                      <div key={partIndex} className="flex gap-2">
                        <Input
                          placeholder="Part Number"
                          value={part.partNumber}
                          onChange={(e) =>
                            handlePartChange(
                              trailerIndex,
                              partIndex,
                              "partNumber",
                              e.target.value
                            )
                          }
                          required
                        />
                        <Input
                          type="number"
                          placeholder="Quantity"
                          value={part.quantity}
                          onChange={(e) =>
                            handlePartChange(
                              trailerIndex,
                              partIndex,
                              "quantity",
                              e.target.value
                            )
                          }
                          required
                          min="1"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removePart(trailerIndex, partIndex)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label>Route Info</Label>
            <Input
              value={editForm.routeInfo || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, routeInfo: e.target.value })
              }
              placeholder="Enter route information"
            />
          </div>

          <div className="space-y-2 lg:col-span-2">
            <Label>Additional Notes</Label>
            <Textarea
              value={editForm.additionalNotes || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, additionalNotes: e.target.value })
              }
              rows={4}
              placeholder="Enter any additional notes"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
