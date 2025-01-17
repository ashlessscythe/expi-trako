"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { useToast } from "@/hooks/use-toast";
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
}

type SplitCriteria = "shipment" | "trailer" | "route" | "part";

export default function BulkUploadPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [splitCriteria, setSplitCriteria] = useState<SplitCriteria>("shipment");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
    type: "file" | "text"
  ) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    formData.append("splitCriteria", splitCriteria);
    formData.append("type", type);

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

  function handleCloseModal() {
    setShowResultModal(false);
    if (result?.success) {
      router.push("/requests");
    }
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
                <SelectItem value="part">Split by Part Number</SelectItem>
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
              <Button onClick={handleCloseModal}>
                {result?.success ? "Go to Requests" : "Close"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
