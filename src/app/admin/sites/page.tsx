import { Metadata } from "next";
import { SitesTable } from "@/components/admin/sites-table";

export const metadata: Metadata = {
  title: "Site Management",
  description: "Manage sites in the system",
};

export default async function SitesPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Site Management</h1>
      </div>
      <SitesTable />
    </div>
  );
}
