"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { Site } from "@prisma/client";
import { PalletCountInput } from "@/components/requests/pallet-count-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle2, AlertCircle, Download } from "lucide-react";

interface ProcessResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: Array<{
    row: number;
    errors: string[];
  }>;
  requests: Array<{
    id: string;
    shipmentNumber: string;
    defaultPalletCount: number;
  }>;
}

type SplitCriteria = "shipment" | "trailer" | "route" | "part";

export default function BulkUploadPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const { user } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>("");
  const [splitCriteria, setSplitCriteria] = useState<SplitCriteria>("shipment");
  const [loading, setLoading] = useState(true);
  const [palletCounts, setPalletCounts] = useState<{
    [key: string]: { id: string; count: number };
  }>({});

  useEffect(() => {
    const fetchUserSites = async () => {
      try {
        if (!user?.id) return;
        const response = await fetch(`/api/users/${user.id}`);
        if (!response.ok) throw new Error("Failed to fetch user sites");
        const userData = await response.json();

        // Combine sites from both old and new relationships
        const userSites = [
          ...(userData.userSites?.map((us: any) => us.site) || []),
          ...(userData.site ? [userData.site] : []),
        ];

        // Remove duplicates
        const uniqueSites = Array.from(
          new Map(userSites.map((site) => [site.id, site])).values()
        );

        setSites(uniqueSites);

        // If user has only one site, set it as default
        if (uniqueSites.length === 1) {
          setSelectedSite(uniqueSites[0].id);
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch user sites:", error);
        toast({
          title: "Error",
          description: "Failed to load sites",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchUserSites();
    }
  }, [user?.id]);

  // Initialize pallet counts when result changes
  useEffect(() => {
    if (result?.requests) {
      const initialCounts = result.requests.reduce((acc, req) => {
        acc[req.shipmentNumber] = {
          id: req.id,
          count: req.defaultPalletCount,
        };
        return acc;
      }, {} as { [key: string]: { id: string; count: number } });
      setPalletCounts(initialCounts);
    }
  }, [result]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
    type: "file" | "text"
  ) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    // Validate site selection if user has multiple sites
    if (sites.length > 1 && !selectedSite) {
      toast({
        title: "Error",
        description: "Please select a site",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.append("splitCriteria", splitCriteria);
    formData.append("type", type);
    formData.append("siteId", selectedSite);
    formData.append("palletCounts", JSON.stringify(palletCounts));

    try {
      const response = await fetch("/api/bulk-upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process upload");
      }

      setResult(data);
      setShowResultModal(true);

      if (data.success) {
        toast({
          title: "Success",
          description: `Successfully processed ${data.successfulRows} out of ${data.totalRows} requests`,
        });
      } else {
        toast({
          title: "Warning",
          description: `Processed with errors: ${data.failedRows} failed rows`,
          variant: "destructive",
        });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to process upload";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSavePalletCounts() {
    try {
      // Filter out any zero or undefined pallet counts
      const validPalletCounts = Object.entries(palletCounts).reduce(
        (acc, [_, data]) => {
          if (data.count > 0) {
            acc[data.id] = data.count;
          }
          return acc;
        },
        {} as { [key: string]: number }
      );

      if (Object.keys(validPalletCounts).length === 0) {
        toast({
          title: "Warning",
          description: "No valid pallet counts to update",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("/api/requests/bulk-pallet-count", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ palletCounts: validPalletCounts }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update pallet counts");
      }

      toast({
        title: "Success",
        description: "Pallet counts updated successfully",
      });

      router.push("/requests");
    } catch (error) {
      console.error("Failed to update pallet counts:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update pallet counts",
        variant: "destructive",
      });
    }
  }

  function handleCloseModal() {
    setShowResultModal(false);
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Bulk Upload Must Go Requests</h1>
          <Link
            href="/templates/bulk-upload-template.csv"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <Download className="w-4 h-4" />
            Download Template
          </Link>
        </div>

        {error && (
          <div className="p-4 text-red-700 bg-red-50 rounded-md border border-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <Card className="p-6">
            <div>Loading...</div>
          </Card>
        ) : sites.length > 1 ? (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Select Site</h2>
            <div className="max-w-xs">
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name} ({site.locationCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-2 text-sm text-muted-foreground">
                Select the site for these requests.
              </p>
            </div>
          </Card>
        ) : null}

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Split Criteria</h2>
          <div className="max-w-xs">
            <Select
              value={splitCriteria}
              onValueChange={(value: SplitCriteria) => setSplitCriteria(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select split criteria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shipment">
                  Split by Shipment Number
                </SelectItem>
                <SelectItem value="trailer">Split by Trailer Number</SelectItem>
                <SelectItem value="route">
                  Split by Route Information
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose how to group the data into separate Must Go requests.
            </p>
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 flex flex-col h-[350px]">
            <h2 className="text-lg font-semibold mb-4">Paste Data</h2>
            <form
              onSubmit={(e) => handleSubmit(e, "text")}
              className="flex flex-col flex-1"
            >
              <div className="flex-1">
                <Textarea
                  name="text"
                  placeholder="Paste your data here..."
                  className="h-full resize-none"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-auto"
              >
                {isLoading ? "Processing..." : "Process Text"}
              </Button>
            </form>
          </Card>

          <Card className="p-6 flex flex-col h-[350px]">
            <h2 className="text-lg font-semibold mb-4">
              Upload Excel/CSV File
            </h2>
            <form
              onSubmit={(e) => handleSubmit(e, "file")}
              className="flex flex-col flex-1"
            >
              <div className="flex-1">
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                  <input
                    type="file"
                    name="file"
                    accept=".xlsx,.xls,.csv"
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-auto"
              >
                {isLoading ? "Processing..." : "Upload File"}
              </Button>
            </form>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Required Format</h2>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>
                For Excel/CSV files or pasted text, ensure the following columns
                are present:
              </p>
              <p className="mt-1">
                <i>(You will be able to edit after creating, so no worries!)</i>
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-medium mb-2">Required Fields:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>SHIPMENT</li>
                  <li>DELPHI P/N</li>
                  <li>MG QTY</li>
                  <li>1ST truck #</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Optional Fields:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>PLANT</li>
                  <li>INSTRUCTIONS (for route information)</li>
                  <li>2ND truck # (for trailer number)</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {result?.success ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Upload Complete
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    Upload Completed with Issues
                  </>
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p className="text-muted-foreground">Total Requests</p>
                    <p className="font-medium">{result?.totalRows || 0}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-muted-foreground">
                      Successfully Created
                    </p>
                    <p className="font-medium text-green-600">
                      {result?.successfulRows || 0}
                    </p>
                  </div>
                  {result?.failedRows ? (
                    <div className="space-y-2">
                      <p className="text-muted-foreground">Failed</p>
                      <p className="font-medium text-red-600">
                        {result.failedRows}
                      </p>
                    </div>
                  ) : null}
                </div>

                {result?.requests && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Pallet Counts</h3>
                    <div className="max-h-[200px] overflow-y-auto">
                      {result.requests.map((request) => (
                        <PalletCountInput
                          key={request.shipmentNumber}
                          shipmentNumber={request.shipmentNumber}
                          defaultCount={request.defaultPalletCount}
                          value={
                            palletCounts[request.shipmentNumber]?.count ||
                            request.defaultPalletCount
                          }
                          onChange={(value) =>
                            setPalletCounts((prev) => ({
                              ...prev,
                              [request.shipmentNumber]: {
                                id: request.id,
                                count: value,
                              },
                            }))
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                {result?.errors && result.errors.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium mb-2">Issues Found:</p>
                    <div className="max-h-[200px] overflow-y-auto">
                      <ul className="list-disc list-inside space-y-2">
                        {result.errors.map((error, index) => (
                          <li key={index} className="text-sm text-red-600">
                            Row {error.row}: {error.errors.join(", ")}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:justify-end">
                <Button variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                {result?.success && (
                  <Button onClick={handleSavePalletCounts}>
                    Save & Go to Requests
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
