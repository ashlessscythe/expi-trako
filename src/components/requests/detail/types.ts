import { RequestStatus, ItemStatus } from "@prisma/client";
import type {
  AuthUser,
  RequestDetail as RequestDetailType,
  PartDetail,
  FormData,
  FormPart,
  FormTrailer,
} from "@/lib/types";

export interface RequestDetailProps {
  id: string;
}

export interface PartsByTrailer {
  [trailerNumber: string]: {
    trailerId: string;
    isTransload: boolean;
    parts: FormPart[];
  };
}

export interface CreatorCardProps {
  creator: {
    name: string;
    role: string;
  };
  createdAt: string;
  deleted?: boolean;
  deletedAt?: string | null;
}

export interface StatusCardProps {
  status: RequestStatus;
  deleted: boolean;
  routeInfo?: string | null;
}

export interface RequestInfoCardProps {
  request: RequestDetailType;
  canUpdateStatus: boolean;
  onEditStatus: () => void;
}

export interface PartsTrailerGridProps {
  partsByTrailer: PartsByTrailer;
  trailers: RequestDetailType["trailers"];
  partDetails: PartDetail[];
}

export interface UpdateRequestCardProps {
  currentStatus: RequestStatus;
  onUpdate: (
    status: RequestStatus,
    note: string,
    forceComplete?: boolean
  ) => Promise<{ requiresConfirmation?: boolean } | void>;
  updating: boolean;
}

export interface NotesCardProps {
  notes: string[];
}

export interface HistoryCardProps {
  logs: RequestDetailType["logs"];
}

export interface EditRequestFormProps {
  initialData: FormData;
  onSave: (data: FormData) => Promise<void>;
  onCancel: () => void;
  updating: boolean;
}

export interface RequestDetailHeaderProps {
  canEdit: boolean;
  onEdit: () => void;
  onBack: () => void;
}

export const getStatusBadgeColor = (status: RequestStatus) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-500";
    case "REPORTING":
      return "bg-cyan-500";
    case "APPROVED":
      return "bg-emerald-500";
    case "REJECTED":
      return "bg-red-500";
    case "IN_PROGRESS":
      return "bg-blue-500";
    case "LOADING":
      return "bg-indigo-500";
    case "IN_TRANSIT":
      return "bg-purple-500";
    case "ARRIVED":
      return "bg-teal-500";
    case "COMPLETED":
      return "bg-green-500";
    case "ON_HOLD":
      return "bg-orange-500";
    case "CANCELLED":
      return "bg-slate-500";
    case "FAILED":
      return "bg-rose-500";
    default:
      return "bg-gray-500";
  }
};
