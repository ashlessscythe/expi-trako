"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface ViewToggleProps {
  onToggle: (showAll: boolean) => void;
  initialShowAll?: boolean;
}

export function ViewToggle({
  onToggle,
  initialShowAll = false,
}: ViewToggleProps) {
  const [showAll, setShowAll] = useState(initialShowAll);

  // Load preference from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("requestsViewAll");
    if (stored !== null) {
      setShowAll(stored === "true");
    }
  }, []);

  const handleToggle = () => {
    const newValue = !showAll;
    setShowAll(newValue);
    localStorage.setItem("requestsViewAll", String(newValue));
    onToggle(newValue);
  };

  return (
    <Button variant="outline" onClick={handleToggle} className="text-sm">
      {showAll ? "Show My Requests" : "Show All Requests"}
    </Button>
  );
}
