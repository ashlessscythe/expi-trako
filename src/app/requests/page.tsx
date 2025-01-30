"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/header";
import RequestList from "@/components/requests/request-list";
import { NewRequestButton } from "@/components/requests/new-request-button";
import { ViewToggle } from "@/components/requests/view-toggle";
import { redirect } from "next/navigation";

export default function RequestsPage() {
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // Load view preference
    const stored = localStorage.getItem("requestsViewAll");
    if (stored !== null) {
      setShowAll(stored === "true");
    }
  }, []);

  useEffect(() => {
    if (!session?.user) {
      redirect("/api/auth/signin");
      return;
    }

    // Fetch requests with showAll parameter
    const fetchRequests = async () => {
      const params = new URLSearchParams();
      if (showAll) {
        params.append("showAll", "true");
      }
      const response = await fetch(`/api/requests?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    };

    fetchRequests();
  }, [session, showAll]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Must-Go Requests</h1>
            {session.user.role === "CUSTOMER_SERVICE" && (
              <ViewToggle onToggle={setShowAll} initialShowAll={showAll} />
            )}
          </div>
          <NewRequestButton />
        </div>
        <RequestList requests={requests} />
      </div>
    </>
  );
}
