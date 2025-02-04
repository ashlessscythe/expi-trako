import { RequestStatus, Role, ItemStatus } from "@prisma/client";

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  role: Role;
}

export interface AuthUser {
  id: string;
  role: Role;
}

export interface PartDetail {
  id: string;
  partNumber: string;
  quantity: number;
  requestId: string;
  trailerId: string;
  status: ItemStatus;
  trailer: {
    id: string;
    trailerNumber: string;
    isTransload: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Trailer {
  id: string;
  trailerNumber: string;
  partDetails: PartDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface RequestTrailer {
  id: string;
  requestId: string;
  trailerId: string;
  status: ItemStatus;
  trailer: Trailer;
  createdAt: string;
  isTransload: boolean;
}

export interface RequestCreator {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface RequestDetail {
  id: string;
  shipmentNumber: string;
  plant?: string | null;
  authorizationNumber?: string;
  trailers: RequestTrailer[];
  partDetails: PartDetail[];
  palletCount: number;
  status: RequestStatus;
  routeInfo?: string | null;
  additionalNotes?: string | null;
  notes: string[];
  deleted: boolean;
  deletedAt: string;
  createdAt: string;
  creator: RequestCreator;
  logs: RequestLog[];
}

export interface RequestLog {
  id: string;
  action: string;
  timestamp: string;
  performer: {
    name: string;
    role: string;
  };
}

export interface FormPart {
  partNumber: string;
  quantity: number;
}

export interface FormTrailer {
  trailerNumber: string;
  isTransload: boolean;
  parts: FormPart[];
}

export interface FormData {
  shipmentNumber: string;
  plant?: string | null;
  authorizationNumber?: string;
  trailers: FormTrailer[];
  palletCount: number;
  routeInfo?: string | null;
  additionalNotes?: string | null;
  status?: RequestStatus;
}

export interface UpdateRequestData {
  status?: RequestStatus;
  note?: string;
}
