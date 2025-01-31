import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { UsersTable } from "@/components/admin/users-table";
import { getAuthUser, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
}

async function updateUserRole(formData: FormData) {
  "use server";

  const userId = formData.get("userId") as string;
  const newRole = formData.get("role") as
    | "ADMIN"
    | "CUSTOMER_SERVICE"
    | "WAREHOUSE"
    | "REPORT_RUNNER"
    | "PENDING";

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  revalidatePath("/admin/users");
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">User Management</h2>
      </div>

      <UsersTable users={users} onRoleChange={updateUserRole} />
    </div>
  );
}
