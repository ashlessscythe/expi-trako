"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatusEditModal from "./status-edit-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { RequestStatus, ItemStatus } from "@prisma/client";
import { useAuth } from "@/lib/auth-context";
import { isWarehouse } from "@/lib/auth";
import type {
  AuthUser,
  RequestDetail as RequestDetailType,
  PartDetail,
  FormData,
  FormPart,
  FormTrailer,
} from "@/lib/types";

interface RequestDetailProps {
  id: string;
}

interface PartsByTrailer {
  [trailerNumber: string]: {
    trailerId: string;
    isTransload: boolean;
    parts: FormPart[];
  };
}

export default function RequestDetail({ id }: RequestDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [request, setRequest] = useState<RequestDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<RequestStatus | "">("");
  const [note, setNote] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<FormData>({
    shipmentNumber: "",
    plant: "",
    authorizationNumber: "",
    palletCount: 0,
    routeInfo: "",
    additionalNotes: "",
    trailers: [],
  });

  const fetchRequest = useCallback(async () => {
    try {
      const response = await fetch(`/api/requests/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch request");
      }

      const data = (await response.json()) as RequestDetailType;
      setRequest(data);
      setNewStatus(data.status);

      // Group parts by trailer
      const partsByTrailer = (data.partDetails || []).reduce(
        (acc: PartsByTrailer, part: PartDetail) => {
          const trailerNumber = part.trailer?.trailerNumber || "Unknown";
          const requestTrailer = data.trailers.find(
            (t) => t.trailerId === part.trailer?.id
          );
          if (!acc[trailerNumber]) {
            acc[trailerNumber] = {
              trailerId: part.trailer?.id || "",
              isTransload: requestTrailer?.isTransload || false,
              parts: [],
            };
          }
          acc[trailerNumber].parts.push({
            partNumber: part.partNumber,
            quantity: part.quantity,
          });
          return acc;
        },
        {}
      );

      // Set edit form with grouped parts
      setEditForm({
        shipmentNumber: data.shipmentNumber,
        plant: data.plant || "",
        authorizationNumber: data.authorizationNumber || "",
        palletCount: data.palletCount,
        routeInfo: data.routeInfo || "",
        additionalNotes: data.additionalNotes || "",
        trailers: Object.entries(partsByTrailer).map(
          ([trailerNumber, { isTransload, parts }]): FormTrailer => ({
            trailerNumber,
            isTransload: isTransload || false,
            parts,
          })
        ),
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load request details";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      router.push("/requests");
    } finally {
      setLoading(false);
    }
  }, [id, router, toast]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  const handleUpdate = async () => {
    if (!note && !newStatus) return;
    if (newStatus === request?.status && !note) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(newStatus !== request?.status && { status: newStatus }),
          ...(note && { note }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update request");
      }

      setRequest(data);
      setNote("");
      toast({
        title: "Success",
        description:
          newStatus !== request?.status
            ? "Request status updated successfully"
            : "Note added successfully",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update request";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleEdit = async () => {
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

    setUpdating(true);
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update request");
      }

      setRequest(data);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Request updated successfully",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update request";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

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
          isTransload: false,
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

  const getStatusBadgeColor = (status: RequestStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500"; // Waiting to be processed
      case "REPORTING":
        return "bg-cyan-500"; // warehouse created req, for reporting only
      case "APPROVED":
        return "bg-emerald-500"; // Request approved, ready to proceed
      case "REJECTED":
        return "bg-red-500"; // Request not approved
      case "IN_PROGRESS":
        return "bg-blue-500"; // Being worked on
      case "LOADING":
        return "bg-indigo-500"; // Parts being loaded
      case "IN_TRANSIT":
        return "bg-purple-500"; // Shipment on the way
      case "ARRIVED":
        return "bg-teal-500"; // Reached destination
      case "COMPLETED":
        return "bg-green-500"; // Successfully finished
      case "ON_HOLD":
        return "bg-orange-500"; // Temporarily paused
      case "CANCELLED":
        return "bg-slate-500"; // Request cancelled
      case "FAILED":
        return "bg-rose-500"; // Critical failure
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!request) {
    return <div>Request not found</div>;
  }

  const authUser: AuthUser | null = user
    ? {
        id: user.id,
        role: user.role,
      }
    : null;

  const canUpdateStatus = authUser
    ? isWarehouse(authUser) && !request.deleted
    : false;
  const canEdit = authUser
    ? (authUser.role === "ADMIN" ||
        isWarehouse(authUser) ||
        (authUser.role === "CUSTOMER_SERVICE" &&
          request.creator.id === authUser.id)) &&
      !request.deleted
    : false;
  const notes = request.notes || [];

  // Group parts by trailer
  const partsByTrailer = (request.partDetails || []).reduce(
    (acc: PartsByTrailer, part: PartDetail) => {
      const trailerNumber = part.trailer?.trailerNumber || "Unknown";
      const requestTrailer = request.trailers.find(
        (t) => t.trailerId === part.trailer?.id
      );
      if (!acc[trailerNumber]) {
        acc[trailerNumber] = {
          trailerId: part.trailer?.id || "",
          isTransload: requestTrailer?.isTransload || false,
          parts: [],
        };
      }
      acc[trailerNumber].parts.push({
        partNumber: part.partNumber,
        quantity: part.quantity,
      });
      return acc;
    },
    {}
  );

  if (isEditing) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Edit Request</h1>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={updating}>
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
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={trailer.isTransload}
                            onChange={(e) => {
                              const newTrailers = [...editForm.trailers];
                              newTrailers[trailerIndex] = {
                                ...newTrailers[trailerIndex],
                                isTransload: e.target.checked,
                              };
                              setEditForm({
                                ...editForm,
                                trailers: newTrailers,
                              });
                            }}
                            className="h-4 w-4 border-gray-300 rounded text-primary focus:ring-primary"
                          />
                          <Label>Is this a transload trailer?</Label>
                        </div>
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Request Details</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          {canEdit && (
            <Button onClick={() => setIsEditing(true)}>Edit Request</Button>
          )}
        </div>
      </div>

      <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        <Card className="lg:h-fit">
          <CardHeader>
            <CardTitle>Created By</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            <div>
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="font-medium">{request.creator.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Role</div>
              <div className="font-medium">{request.creator.role}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Date</div>
              <div className="font-medium">
                {new Date(request.createdAt).toLocaleString()}
              </div>
            </div>
            {request.deleted && request.deletedAt && (
              <div>
                <div className="text-sm text-muted-foreground">Deleted At</div>
                <div className="font-medium text-destructive">
                  {new Date(request.deletedAt).toLocaleString()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:h-fit">
          <CardHeader>
            <CardTitle>Status Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 items-center justify-between">
              <div className="flex gap-2 items-center">
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge className={getStatusBadgeColor(request.status)}>
                    {request.status.replace("_", " ")}
                  </Badge>
                </div>
                {request.deleted && (
                  <Badge variant="destructive">Deleted</Badge>
                )}
              </div>
            </div>
            {request.routeInfo && (
              <div>
                <div className="text-sm text-muted-foreground">Route Info</div>
                <div className="font-medium">{request.routeInfo}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Request Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-x-8">
            <div>
              <div className="text-sm text-muted-foreground">
                Shipment Number
              </div>
              <div className="font-medium">{request.shipmentNumber}</div>
            </div>
            {request.plant && (
              <div>
                <div className="text-sm text-muted-foreground">Plant</div>
                <div className="font-medium">{request.plant}</div>
              </div>
            )}
            {request.authorizationNumber && (
              <div>
                <div className="text-sm text-muted-foreground">
                  Authorization Number
                </div>
                <div className="font-medium">{request.authorizationNumber}</div>
              </div>
            )}
            <div>
              {canUpdateStatus && (
                <Button
                  variant="default"
                  onClick={() => setIsStatusModalOpen(true)}
                >
                  Edit Status
                </Button>
              )}
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Pallet Count</div>
              <div className="font-medium">{request.palletCount}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Parts by Trailer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 lg:grid-cols-2">
              {Object.entries(partsByTrailer).map(
                ([trailerNumber, { isTransload, parts }]) => (
                  <Card key={trailerNumber}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        Trailer: {trailerNumber}
                        {isTransload && (
                          <Badge variant="secondary">Transload</Badge>
                        )}
                        <Badge variant="outline">
                          {request.trailers
                            .find(
                              (t) => t.trailer.trailerNumber === trailerNumber
                            )
                            ?.status.replace("_", " ") || "PENDING"}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {parts.map((part, index) => (
                          <div
                            key={index}
                            className="bg-muted px-2 py-1 rounded flex justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <span>{part.partNumber}</span>
                              <Badge variant="outline">
                                {request.partDetails
                                  .find((p) => p.partNumber === part.partNumber)
                                  ?.status.replace("_", " ") || "PENDING"}
                              </Badge>
                            </div>
                            <span className="text-muted-foreground">
                              Qty: {part.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {canUpdateStatus && (
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
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNote(e.target.value)
                  }
                  rows={4}
                />
              </div>

              <Button
                onClick={handleUpdate}
                disabled={
                  updating ||
                  (!note && (!newStatus || newStatus === request.status))
                }
                className="w-full lg:col-span-2"
              >
                {updating ? "Updating..." : "Update Request"}
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notes.length > 0 ? (
                notes.map((note: string, index: number) => (
                  <div key={index} className="bg-muted p-3 rounded">
                    {note}
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">
                  No notes yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {request.logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <div className="font-medium">{log.action}</div>
                    <div className="text-sm text-muted-foreground">
                      By {log.performer.name} ({log.performer.role})
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {canUpdateStatus && (
        <StatusEditModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          requestId={id}
          trailers={request.trailers}
          parts={request.partDetails}
          onSuccess={fetchRequest}
        />
      )}
    </div>
  );
}
