import { RequestStatus } from "@prisma/client";

export function getStatusBadgeColor(status: RequestStatus): string {
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
}
