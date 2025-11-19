import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Request } from "../types";

interface PaginationOptions {
  pageSize?: number;
  initialPage?: number;
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  requests: Request[];
  isLoading: boolean;
  isBackgroundLoading: boolean;
  error: string | null;
}

type FetchRequestsFunction = (
  page: number,
  pageSize: number,
  countOnly?: boolean
) => Promise<{
  requests?: Request[];
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  count?: number;
}>;

export function useRequestPagination(
  fetchRequests: FetchRequestsFunction,
  options: PaginationOptions = {}
) {
  const { pageSize = 10 } = options;
  const router = useRouter();
  const searchParams = useSearchParams();
  const abortControllerRef = useRef<AbortController | null>(null);
  const pageCacheRef = useRef<Record<number, Request[]>>({});

  // Initialize page from URL or default to 1
  const initialPage = (() => {
    const pageParam = searchParams.get("page");
    return pageParam ? parseInt(pageParam, 10) : 1;
  })();

  const [state, setState] = useState<PaginationState>({
    currentPage: initialPage,
    totalPages: 0,
    totalCount: 0,
    pageSize,
    requests: [],
    isLoading: true,
    isBackgroundLoading: false,
    error: null,
  });

  // Cache for preloaded pages (using ref to avoid dependency issues)
  const [pageCache, setPageCache] = useState<Record<number, Request[]>>({});

  // Update URL when page changes
  const updateUrlPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page === 1) {
        params.delete("page");
      } else {
        params.set("page", page.toString());
      }
      const newUrl = params.toString()
        ? `?${params.toString()}`
        : window.location.pathname;
      router.replace(newUrl, { scroll: false });
    },
    [searchParams, router]
  );

  // Preload a specific page in the background
  const preloadPage = useCallback(
    async (page: number) => {
      // Skip if we already have this page cached
      if (pageCacheRef.current[page]) return;

      try {
        setState((prev) => ({ ...prev, isBackgroundLoading: true }));

        // Fetch the page data
        const result = await fetchRequests(page, pageSize);

        if (result.requests) {
          // Add to cache (both ref and state)
          pageCacheRef.current[page] = result.requests;
          setPageCache((prev) => ({ ...prev, [page]: result.requests! }));
        }
      } catch (error) {
        // Silently fail for background loads
        console.error("Failed to preload page:", error);
      } finally {
        setState((prev) => ({ ...prev, isBackgroundLoading: false }));
      }
    },
    [fetchRequests, pageSize]
  );

  // Load initial data and total count
  useEffect(() => {
    const loadInitialData = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Cancel any in-flight requests
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();

        // Fetch the first page of data
        const result = await fetchRequests(initialPage, pageSize);

        if (result.requests && result.pagination) {
          setState((prev) => ({
            ...prev,
            requests: result.requests || [],
            currentPage: result.pagination!.page,
            totalPages: result.pagination!.totalPages,
            totalCount: result.pagination!.totalCount,
            pageSize: result.pagination!.pageSize,
            isLoading: false,
          }));

          // Cache the first page (both ref and state)
          pageCacheRef.current[initialPage] = result.requests;
          setPageCache({ [initialPage]: result.requests });

          // Preload the next page if it exists
          if (initialPage < result.pagination!.totalPages) {
            preloadPage(initialPage + 1);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          // Request was aborted, do nothing
          return;
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error ? error.message : "Failed to load requests",
        }));
      }
    };

    loadInitialData();

    // Cleanup function to abort any pending requests when component unmounts
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchRequests, initialPage, pageSize, preloadPage]);

  // Handle page change
  const handlePageChange = useCallback(
    async (page: number) => {
      // Update URL
      updateUrlPage(page);

      // Scroll to top of the list
      window.scrollTo({ top: 0, behavior: "smooth" });

      // If we have this page cached, use it immediately
      if (pageCacheRef.current[page]) {
        setState((prev) => ({
          ...prev,
          currentPage: page,
          requests: pageCacheRef.current[page],
          isLoading: false,
        }));

        // Preload the next page if it exists
        if (page < state.totalPages) {
          preloadPage(page + 1);
        }

        return;
      }

      // Otherwise, load the page
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Cancel any in-flight requests
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();

        // Fetch the page data
        const result = await fetchRequests(page, pageSize);

        if (result.requests && result.pagination) {
          setState((prev) => ({
            ...prev,
            requests: result.requests || [],
            currentPage: page,
            isLoading: false,
          }));

          // Cache the page (both ref and state)
          pageCacheRef.current[page] = result.requests!;
          setPageCache((prev) => ({ ...prev, [page]: result.requests! }));

          // Preload the next page if it exists
          if (page < state.totalPages) {
            preloadPage(page + 1);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          // Request was aborted, do nothing
          return;
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error ? error.message : "Failed to load requests",
        }));
      }
    },
    [
      updateUrlPage,
      pageCache,
      state.totalPages,
      preloadPage,
      fetchRequests,
      pageSize,
    ]
  );

  const getVisiblePages = useCallback(() => {
    const delta = 3; // Number of pages to show before and after current page
    const pages: (number | string)[] = [];
    const { currentPage, totalPages } = state;

    // Always add first page
    pages.push(1);

    // Calculate range of pages around current page
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    // Add ellipsis after first page if needed
    if (rangeStart > 2) {
      pages.push("start-ellipsis");
    }

    // Add pages in range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (rangeEnd < totalPages - 1) {
      pages.push("end-ellipsis");
    }

    // Always add last page if not already included
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }, [state]);

  return {
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    totalCount: state.totalCount,
    paginatedRequests: state.requests,
    isLoading: state.isLoading,
    isBackgroundLoading: state.isBackgroundLoading,
    error: state.error,
    handlePageChange,
    getVisiblePages,
  };
}
