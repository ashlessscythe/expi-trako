"use client";

import { Suspense, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import RequestList from "@/components/requests/request-list";
import { NewRequestButton } from "@/components/requests/new-request-button";
import { ViewToggle } from "@/components/requests/view-toggle";
import { redirect } from "next/navigation";

// Define props interface for the RequestsContent component
interface RequestsContentProps {
  showAll: boolean;
  setShowAll: (value: boolean) => void;
}

// Client component that uses search params
function RequestsContent({ showAll, setShowAll }: RequestsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Function to update URL with showAll parameter
  const updateUrlWithShowAll = (showAllValue: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (showAllValue) {
      params.set("showAll", "true");
    } else {
      params.delete("showAll");
    }
    const newUrl = params.toString()
      ? `?${params.toString()}`
      : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  };

  // Save view preference when it changes and update URL
  useEffect(() => {
    localStorage.setItem("requestsViewAll", showAll.toString());
    updateUrlWithShowAll(showAll);
  }, [showAll]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Must-Go Requests</h1>
          {/* ViewToggle will be passed from parent */}
        </div>
        <NewRequestButton />
      </div>
      <RequestList />
    </div>
  );
}

export default function RequestsPage() {
  const { data: session, status } = useSession();
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // Load view preference
    const stored = localStorage.getItem("requestsViewAll");
    if (stored !== null) {
      const storedValue = stored === "true";
      setShowAll(storedValue);
    }
  }, []);

  useEffect(() => {
    if (!session?.user) {
      redirect("/api/auth/signin");
      return;
    }
  }, [session]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <>
      <Header />
      <Suspense fallback={<div>Loading requests...</div>}>
        <RequestsContent showAll={showAll} setShowAll={setShowAll} />
      </Suspense>
      {session.user.role === "CUSTOMER_SERVICE" && (
        <div className="container mx-auto px-4 -mt-8 mb-8">
          <ViewToggle onToggle={setShowAll} initialShowAll={showAll} />
        </div>
      )}
    </>
  );
}
