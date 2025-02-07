"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { isWarehouse } from "@/lib/auth";
import { RequestStatus } from "@prisma/client";
import type {
  AuthUser,
  RequestDetail as RequestDetailType,
  PartDetail,
  FormData,
} from "@/lib/types";
import {
  RequestDetailHeader,
  CreatorCard,
  StatusCard,
  RequestInfoCard,
  PartsTrailerGrid,
  UpdateRequestCard,
  NotesCard,
  HistoryCard,
  EditRequestForm,
  PartsByTrailer,
} from "./detail";
import StatusEditModal from "./status-edit-modal";

interface RequestDetailProps {
  id: string;
}

export default function RequestDetail({ id }: RequestDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [request, setRequest] = useState<RequestDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
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
          ([trailerNumber, { parts }]) => ({
            trailerNumber,
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

  const handleUpdate = async (
    status: RequestStatus,
    note: string,
    forceComplete?: boolean
  ) => {
    if (!note && !status) return;
    if (status === request?.status && !note) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(status !== request?.status && { status }),
          ...(note && { note }),
          ...(forceComplete !== undefined && { forceComplete }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Return the error response for confirmation requests
        if (data.requiresConfirmation && data.itemsIncomplete) {
          return { requiresConfirmation: true };
        }
        throw new Error(data.error || "Failed to update request");
      }

      setRequest(data);
      toast({
        title: "Success",
        description:
          status !== request?.status
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

  const handleEdit = async (formData: FormData) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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

  // Group parts by trailer for display
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
      <EditRequestForm
        initialData={editForm}
        onSave={handleEdit}
        onCancel={() => setIsEditing(false)}
        updating={updating}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <RequestDetailHeader
        canEdit={canEdit}
        onEdit={() => setIsEditing(true)}
        onBack={() => router.back()}
      />

      <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        <CreatorCard
          creator={request.creator}
          createdAt={request.createdAt}
          deleted={request.deleted}
          deletedAt={request.deletedAt}
        />

        <StatusCard
          status={request.status}
          deleted={request.deleted}
          routeInfo={request.routeInfo}
        />

        <RequestInfoCard
          request={request}
          canUpdateStatus={canUpdateStatus}
          onEditStatus={() => setIsStatusModalOpen(true)}
        />

        <PartsTrailerGrid
          partsByTrailer={partsByTrailer}
          trailers={request.trailers}
          partDetails={request.partDetails}
        />

        {canUpdateStatus && (
          <UpdateRequestCard
            currentStatus={request.status}
            onUpdate={handleUpdate}
            updating={updating}
          />
        )}

        <NotesCard notes={request.notes || []} />

        <HistoryCard logs={request.logs} />
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
