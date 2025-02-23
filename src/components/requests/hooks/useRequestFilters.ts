import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RequestStatus } from "@prisma/client";
import type { Request, FilterState, SortField } from "../types";

export function useRequestFilters(initialRequests: Request[]) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prevSearchParamsRef = useRef<string>(searchParams.toString());

  // Filter states
  const [filters, setFiltersState] = useState<FilterState>(() => ({
    statusFilter: (searchParams.get("status") as RequestStatus | "ALL") || "ALL",
    plantFilter: searchParams.get("plant") || "all",
    searchQuery: searchParams.get("search") || "",
    dateRange: {
      start: searchParams.get("dateStart") || "",
      end: searchParams.get("dateEnd") || "",
    },
    hideCompleted: searchParams.get("hideCompleted") === "true",
    sortField: "createdAt",
    sortDirection: "desc",
  }));

  // Get unique plants for filter dropdown
  const uniquePlants = useMemo(() => {
    const plants = new Set(
      initialRequests
        .map((r) => r.plant)
        .filter((plant): plant is string => plant !== null)
    );
    return Array.from(plants).sort();
  }, [initialRequests]);

  // Update URL with current filters
  const updateUrlParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === "ALL" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      const newParamsString = params.toString();
      // Only update URL if params have actually changed
      if (newParamsString !== prevSearchParamsRef.current) {
        prevSearchParamsRef.current = newParamsString;
        const newUrl = newParamsString
          ? `?${newParamsString}`
          : window.location.pathname;
        router.replace(newUrl, { scroll: false });
      }
    },
    [searchParams, router]
  );

  // Skip initial render and debounce URL updates
  const isFirstRender = useRef(true);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Skip the first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Clear any existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Create URL update params
    const updates = {
      status: filters.statusFilter,
      plant: filters.plantFilter,
      search: filters.searchQuery,
      dateStart: filters.dateRange.start,
      dateEnd: filters.dateRange.end,
      hideCompleted: filters.hideCompleted ? "true" : null,
    };

    // Set new timeout for URL update
    updateTimeoutRef.current = setTimeout(() => {
      updateUrlParams(updates);
    }, 300); // Debounce time

    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [
    filters.statusFilter,
    filters.plantFilter,
    filters.searchQuery,
    filters.dateRange.start,
    filters.dateRange.end,
    filters.hideCompleted,
    updateUrlParams,
  ]);

  const clearFilters = useCallback(() => {
    const newFilters = {
      statusFilter: "ALL",
      plantFilter: "all",
      searchQuery: "",
      dateRange: { start: "", end: "" },
      hideCompleted: false,
      sortField: "createdAt",
      sortDirection: "desc",
    } as const;
    
    setFiltersState(newFilters);
    router.replace(window.location.pathname, { scroll: false });
  }, [router]);

  const handleSort = useCallback((field: SortField) => {
    setFiltersState((prev: FilterState) => ({
      ...prev,
      sortField: field,
      sortDirection:
        prev.sortField === field
          ? prev.sortDirection === "asc"
            ? "desc"
            : "asc"
          : "asc",
    }));
  }, []);

  const filteredAndSortedRequests = useMemo(() => {
    return initialRequests
      .filter((request) => {
        // Hide completed/cancelled/rejected if toggle is on
        if (filters.hideCompleted) {
          if (["COMPLETED", "CANCELLED", "REJECTED"].includes(request.status)) {
            return false;
          }
        }

        const matchesStatus =
          filters.statusFilter === "ALL" || request.status === filters.statusFilter;
        const matchesPlant =
          filters.plantFilter === "all" || request.plant === filters.plantFilter;
        const matchesSearch =
          !filters.searchQuery ||
          request.shipmentNumber
            .toLowerCase()
            .includes(filters.searchQuery.toLowerCase()) ||
          request.creator.name
            .toLowerCase()
            .includes(filters.searchQuery.toLowerCase()) ||
          request.routeInfo?.toLowerCase().includes(filters.searchQuery.toLowerCase());
        const matchesDateRange =
          (!filters.dateRange.start ||
            new Date(request.createdAt) >= new Date(filters.dateRange.start)) &&
          (!filters.dateRange.end ||
            new Date(request.createdAt) <= new Date(filters.dateRange.end));

        return matchesStatus && matchesPlant && matchesSearch && matchesDateRange;
      })
      .sort((a, b) => {
        let comparison = 0;
        switch (filters.sortField) {
          case "shipmentNumber":
            comparison = a.shipmentNumber.localeCompare(b.shipmentNumber);
            break;
          case "plant":
            comparison = (a.plant || "").localeCompare(b.plant || "");
            break;
          case "palletCount":
            comparison = a.palletCount - b.palletCount;
            break;
          case "status":
            comparison = a.status.localeCompare(b.status);
            break;
          case "createdAt":
            comparison =
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
        }
        return filters.sortDirection === "asc" ? comparison : -comparison;
      });
  }, [
    initialRequests,
    filters.statusFilter,
    filters.plantFilter,
    filters.searchQuery,
    filters.dateRange,
    filters.sortField,
    filters.sortDirection,
    filters.hideCompleted,
  ]);

  const setFilters = useCallback((updates: Partial<FilterState>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  return {
    filters,
    setFilters,
    uniquePlants,
    filteredAndSortedRequests,
    clearFilters,
    handleSort,
  };
}
