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
      const storedValue = stored === "true";
      setShowAll(storedValue);
      onToggle(storedValue);
    } else if (initialShowAll) {
      // If no stored preference but initialShowAll is true, use that
      setShowAll(initialShowAll);
      onToggle(initialShowAll);
    }
  }, [onToggle, initialShowAll]);

  const handleToggle = () => {
    const newValue = !showAll;
    setShowAll(newValue);
    localStorage.setItem("requestsViewAll", String(newValue));
    onToggle(newValue);
  };

  return (
    <Button
      variant="outline"
      onClick={handleToggle}
      className="bg-pink-600 hover:bg-pink-900 text-white font-semibold px-6 h-10 rounded-md shadow-lg"
    >
      {showAll ? "Show My Requests" : "Show All Requests"}
    </Button>
  );
}
