"use client";

import { Card } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { APP_NAME } from "@/lib/config";

export default function GuidePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container py-8 space-y-8">
          <h1 className="text-4xl font-bold mb-8">How to Use {APP_NAME}</h1>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
            <div className="space-y-4">
              <section>
                <h3 className="text-xl font-medium mb-2">
                  1. Creating an Account
                </h3>
                <p>
                  To get started with {APP_NAME}, you'll need to create an
                  account. Click the &quot;Sign Up&quot; button in the top right
                  corner and fill in your details.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-2">
                  2. Adding Your First Request
                </h3>
                <p>Once logged in, you can create a new request by:</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Clicking the &quot;New Request&quot; button</li>
                  <li>Filling in the request details</li>
                  <li>Submitting the form</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-2">
                  3. Managing Requests
                </h3>
                <p>
                  You can view and manage your requests from the dashboard. Here
                  you can:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Track request status</li>
                  <li>Update request details</li>
                  <li>View request history</li>
                </ul>
              </section>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Advanced Features</h2>
            <div className="space-y-4">
              <section>
                <h3 className="text-xl font-medium mb-2">Bulk Upload</h3>
                <p>For multiple requests, you have two options:</p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>
                    <strong>Recommended:</strong> Copy and paste your Excel data
                    into the Paste Data section, and the system will
                    automatically create the requests for you.
                  </li>
                  <li>
                    Alternatively, use the CSV upload method:
                    <ul className="list-disc list-inside ml-6">
                      <li>Navigate to the Bulk Upload section</li>
                      <li>Download the template CSV file</li>
                      <li>Fill in your requests</li>
                      <li>Upload the completed file</li>
                    </ul>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-2">
                  Reports (Admin only)
                </h3>
                <p>
                  Generate detailed reports to track and analyze your requests:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2">
                  <li>Access the Reports section</li>
                  <li>Select your desired report type</li>
                  <li>Set date ranges and filters</li>
                  <li>Export or view online</li>
                </ul>
              </section>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
