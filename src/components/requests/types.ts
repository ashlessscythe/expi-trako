import { RequestStatus, ItemStatus } from "@prisma/client";

export interface RequestCreator {
  id: string;
  name: string;
  role: string;
  site: {
    id: string;
    name: string;
  } | null;
}

export interface Request {
  id: string;
  shipmentNumber: string;
  plant: string | null;
  routeInfo: string | null;
  additionalNotes: string | null;
  notes: string[];
  palletCount: number;
  status: RequestStatus;
  creator: RequestCreator;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  deletedAt: string | null;
  site: {
    id: string;
    name: string;
  } | null;
  trailers: {
    id: string;
    requestId: string;
    trailerId: string;
    trailer: {
      id: string;
      trailerNumber: string;
      createdAt: string;
      updatedAt: string;
    };
    status: ItemStatus;
    isTransload: boolean;
    createdAt: string;
  }[];
  partDetails: {
    id: string;
    partNumber: string;
    quantity: number;
    status: ItemStatus;
    requestId: string;
    trailerId: string;
    createdAt: string;
    updatedAt: string;
  }[];
  logs: {
    id: string;
    action: string;
    timestamp: string;
    performer: {
      name: string;
      role: string;
    };
  }[];
}

export type SortField =
  | "shipmentNumber"
  | "plant"
  | "palletCount"
  | "status"
  | "createdAt";

export type SortDirection = "asc" | "desc";

export interface RequestListProps {
  requests: Request[];
  showActions?: boolean;
}

export interface FilterState {
  statusFilter: RequestStatus | "ALL";
  plantFilter: string;
  searchQuery: string;
  dateRange: {
    start: string;
    end: string;
  };
  hideCompleted: boolean;
  sortField: SortField;
  sortDirection: SortDirection;
}
