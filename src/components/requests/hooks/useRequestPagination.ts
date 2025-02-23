import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Request } from "../types";

interface PaginationOptions {
  itemsPerPage?: number;
}

export function useRequestPagination(
  requests: Request[],
  options: PaginationOptions = {}
) {
  const { itemsPerPage = 10 } = options;
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize page from URL or default to 1
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get("page");
    return pageParam ? parseInt(pageParam, 10) : 1;
  });

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

  // Reset to first page when requests array changes length
  useEffect(() => {
    const pageParam = searchParams.get("page");
    const savedPage = pageParam ? parseInt(pageParam, 10) : 1;
    setCurrentPage(savedPage);
  }, [requests.length, searchParams]);

  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = requests.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    updateUrlPage(page);
    // Scroll to top of the list when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [updateUrlPage]);

  const getVisiblePages = useCallback(() => {
    const delta = 3; // Number of pages to show before and after current page
    const pages: (number | string)[] = [];

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
  }, [currentPage, totalPages]);

  return {
    currentPage,
    totalPages,
    paginatedRequests,
    handlePageChange,
    getVisiblePages,
  };
}
