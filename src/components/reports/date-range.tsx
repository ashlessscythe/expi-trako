"use client";

import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface DateRangeProps {
  startDate?: string;
  endDate?: string;
  defaultStartDate: string;
  defaultEndDate: string;
  startParam: string;
  endParam: string;
}

export function DateRange({
  startDate,
  endDate,
  defaultStartDate,
  defaultEndDate,
  startParam,
  endParam,
}: DateRangeProps) {
  const router = useRouter();

  const updateDateRange = (param: string, value: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set(param, value);
    router.push(url.toString());
  };

  return (
    <div className="flex gap-2">
      <Input
        type="date"
        defaultValue={startDate || defaultStartDate}
        max={endDate || defaultEndDate}
        onChange={(e) => updateDateRange(startParam, e.target.value)}
      />
      <Input
        type="date"
        defaultValue={endDate || defaultEndDate}
        min={startDate || defaultStartDate}
        onChange={(e) => updateDateRange(endParam, e.target.value)}
      />
    </div>
  );
}
