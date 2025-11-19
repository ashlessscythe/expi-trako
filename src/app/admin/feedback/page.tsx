"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FeedbackStatus } from "@prisma/client";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

interface FeedbackItem {
  id: string;
  message: string;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminFeedbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "">("");

  // Redirect if not admin
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, status, router]);

  // Fetch feedback data
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        queryParams.append("page", pagination.page.toString());
        queryParams.append("limit", pagination.limit.toString());

        if (statusFilter) {
          queryParams.append("status", statusFilter);
        }

        const response = await fetch(`/api/feedback?${queryParams.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch feedback");
        }

        const data = await response.json();
        setFeedback(data.feedback);
        setPagination(data.pagination);
      } catch (error) {
        console.error("Error fetching feedback:", error);
        toast({
          title: "Error",
          description: "Failed to load feedback data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (session?.user.role === "ADMIN") {
      fetchFeedback();
    }
  }, [session, pagination.page, pagination.limit, statusFilter, toast]);

  // Update feedback status
  const updateFeedbackStatus = async (id: string, status: FeedbackStatus) => {
    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update feedback status");
      }

      // Update local state
      setFeedback((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );

      toast({
        title: "Success",
        description: "Feedback status updated successfully",
      });
    } catch (error) {
      console.error("Error updating feedback status:", error);
      toast({
        title: "Error",
        description: "Failed to update feedback status",
        variant: "destructive",
      });
    }
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  // Get status badge color
  const getStatusBadgeVariant = (status: FeedbackStatus): BadgeVariant => {
    switch (status) {
      case "PENDING":
        return "pending";
      case "REVIEWED":
        return "secondary";
      case "RESOLVED":
        return "approved";
      case "DISMISSED":
        return "destructive";
      default:
        return "default";
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (status === "loading" || !session) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>User Feedback</CardTitle>
          <CardDescription>
            View and manage feedback submitted by users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div>
              <label
                htmlFor="status-filter"
                className="mr-2 text-sm font-medium"
              >
                Filter by status:
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as FeedbackStatus | "")
                }
                className="rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="">All</option>
                <option value="PENDING">Pending</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="RESOLVED">Resolved</option>
                <option value="DISMISSED">Dismissed</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-10 text-center">Loading feedback data...</div>
          ) : feedback.length === 0 ? (
            <div className="py-10 text-center">No feedback found</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="w-[40%]">Feedback</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedback.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.user.email}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-pre-wrap">
                        {item.message}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(item.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          {item.status === "PENDING" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateFeedbackStatus(item.id, "REVIEWED")
                              }
                            >
                              Mark Reviewed
                            </Button>
                          )}
                          {(item.status === "PENDING" ||
                            item.status === "REVIEWED") && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() =>
                                  updateFeedbackStatus(item.id, "RESOLVED")
                                }
                              >
                                Resolve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  updateFeedbackStatus(item.id, "DISMISSED")
                                }
                              >
                                Dismiss
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
