"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface StatusToggleProps {
  onToggle: (hideCompleted: boolean) => void;
  initialHideCompleted?: boolean;
}

export function StatusToggle({
  onToggle,
  initialHideCompleted = false,
}: StatusToggleProps) {
  const [hideCompleted, setHideCompleted] = useState(initialHideCompleted);

  // Load preference from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("requestsHideCompleted");
    if (stored !== null) {
      const storedValue = stored === "true";
      setHideCompleted(storedValue);
      onToggle(storedValue);
    }
  }, [onToggle]);

  const handleToggle = () => {
    const newValue = !hideCompleted;
    setHideCompleted(newValue);
    localStorage.setItem("requestsHideCompleted", String(newValue));
    onToggle(newValue);
  };

  return (
    <Button
      variant="outline"
      onClick={handleToggle}
      className="bg-pink-600 hover:bg-pink-900 text-white font-semibold px-6 h-10 rounded-md shadow-lg"
    >
      {hideCompleted ? "Show All Statuses" : "Hide Completed"}
    </Button>
  );
}
