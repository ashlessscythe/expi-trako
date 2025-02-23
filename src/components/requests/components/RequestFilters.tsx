import { useCallback, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { debounce } from "@/lib/utils/debounce";
import { Button } from "@/components/ui/button";
import { StatusToggle } from "@/components/requests/status-toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RequestStatus } from "@prisma/client";
import type { FilterState } from "../types";

interface RequestFiltersProps {
  filters: FilterState;
  onFiltersChange: (updates: Partial<FilterState>) => void;
  uniquePlants: string[];
  onClearFilters: () => void;
  onDownloadCSV: () => void;
  onDownloadTransloads: () => void;
  userRole?: string;
}

export function RequestFilters({
  filters,
  onFiltersChange,
  uniquePlants,
  onClearFilters,
  onDownloadCSV,
  onDownloadTransloads,
  userRole,
}: RequestFiltersProps) {
  // Local state for controlled inputs
  const [searchValue, setSearchValue] = useState(filters.searchQuery);

  // Debounced filter updates
  const debouncedUpdate = useCallback(
    debounce((updates: Partial<FilterState>) => {
      onFiltersChange(updates);
    }, 300),
    [onFiltersChange]
  );

  // Effect to sync local search state with filters
  useEffect(() => {
    setSearchValue(filters.searchQuery);
  }, [filters.searchQuery]);

  // Handlers
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);
      debouncedUpdate({ searchQuery: value });
    },
    [debouncedUpdate]
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      debouncedUpdate({ statusFilter: value as RequestStatus | "ALL" });
    },
    [debouncedUpdate]
  );

  const handlePlantChange = useCallback(
    (value: string) => {
      debouncedUpdate({ plantFilter: value });
    },
    [debouncedUpdate]
  );

  const handleDateChange = useCallback(
    (type: "start" | "end") => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      debouncedUpdate({
        dateRange: {
          ...filters.dateRange,
          [type]: value,
        },
      });
    },
    [debouncedUpdate, filters.dateRange]
  );

  // Cleanup debounced updates on unmount
  useEffect(() => {
    return () => {
      debouncedUpdate.cancel?.();
    };
  }, [debouncedUpdate]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Search shipment, route, or creator..."
          value={searchValue}
          onChange={handleSearchChange}
          className="w-full"
        />
        <Select
          value={filters.statusFilter}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {Object.values(RequestStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.plantFilter}
          onValueChange={handlePlantChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Plant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plants</SelectItem>
            {uniquePlants.map((plant) => (
              <SelectItem key={plant} value={plant}>
                {plant}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="date"
            value={filters.dateRange.start}
            onChange={handleDateChange("start")}
            className="w-full"
          />
          <Input
            type="date"
            value={filters.dateRange.end}
            onChange={handleDateChange("end")}
            className="w-full"
          />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <StatusToggle
          onToggle={(hideCompleted) => debouncedUpdate({ hideCompleted })}
          initialHideCompleted={filters.hideCompleted}
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClearFilters} className="text-sm">
            Clear Filters
          </Button>
          {["ADMIN", "REPORT_RUNNER", "WAREHOUSE"].includes(userRole || "") && (
            <>
              <Button
                variant="outline"
                onClick={onDownloadCSV}
                className="text-sm"
              >
                Download CSV
              </Button>
              <Button
                variant="outline"
                onClick={onDownloadTransloads}
                className="text-sm"
              >
                Download Transloads
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
