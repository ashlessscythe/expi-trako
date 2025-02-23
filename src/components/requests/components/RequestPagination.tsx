import { Button } from "@/components/ui/button";

interface RequestPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function RequestPagination({
  currentPage,
  totalPages,
  onPageChange,
}: RequestPaginationProps) {
  if (totalPages <= 1) return null;

  const renderPageButton = (page: number) => (
    <Button
      key={page}
      variant={currentPage === page ? "default" : "outline"}
      size="sm"
      onClick={() => onPageChange(page)}
      className="w-8"
    >
      {page}
    </Button>
  );

  const renderEllipsis = (key: string) => (
    <span key={key} className="px-2">
      ...
    </span>
  );

  const getVisiblePages = () => {
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
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <div className="flex items-center gap-1">
        {getVisiblePages().map((page, index) =>
          typeof page === "number"
            ? renderPageButton(page)
            : renderEllipsis(page)
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );
}
