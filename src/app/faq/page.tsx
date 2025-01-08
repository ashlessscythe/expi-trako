"use client";

import { Card } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { APP_NAME } from "@/lib/config";

export default function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container py-8 space-y-8">
          <h1 className="text-4xl font-bold mb-8">{APP_NAME} FAQ</h1>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">General Questions</h2>
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-medium mb-2">
                  What is {APP_NAME}?
                </h3>
                <p>
                  {APP_NAME} is a comprehensive tracking system designed to help
                  organizations manage and monitor their requests efficiently.
                  It provides tools for creating, tracking, and analyzing
                  various types of requests.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-2">Is my data secure?</h3>
                <p>
                  Yes, we take data security seriously. All data is encrypted,
                  and we follow industry best practices for data protection.
                  Access is restricted based on user roles and permissions.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-2">
                  Can I export my data?
                </h3>
                <p>
                  Yes, {APP_NAME} provides various export options. You can
                  export your data in different formats including CSV and PDF
                  through the Reports section.
                </p>
              </section>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Account Management</h2>
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-medium mb-2">
                  How do I reset my password?
                </h3>
                <p>
                  You can reset your password by clicking the &quot;Forgot
                  Password&quot; link on the login page. Follow the instructions
                  sent to your email to create a new password.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-2">
                  Can I change my email address?
                </h3>
                <p>
                  Yes, you can update your email address in your account
                  settings. Note that you may need to verify your new email
                  address before the change takes effect.
                </p>
              </section>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Using {APP_NAME}</h2>
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-medium mb-2">
                  How do I track my requests?
                </h3>
                <p>
                  You can track your requests through the dashboard. Each
                  request has a unique ID and status that updates in real-time.
                  You can also set up notifications for status changes.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-2">
                  What file formats are supported for bulk upload?
                </h3>
                <p>
                  The bulk upload feature supports CSV files. We provide a
                  template that you can download to ensure your data is
                  formatted correctly.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-medium mb-2">
                  Can I delete a request?
                </h3>
                <p>
                  Yes, you can delete requests if you have the appropriate
                  permissions. However, for audit purposes, deleted requests are
                  soft-deleted and can be restored if needed.
                </p>
              </section>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
