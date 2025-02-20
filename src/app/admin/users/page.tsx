import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { UsersTable } from "@/components/admin/users-table";
import { getAuthUser, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sendEmail } from "@/lib/email";
import { RoleChangeEmail } from "@/components/role-change-email";

async function getUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      site: {
        select: {
          id: true,
          name: true,
          locationCode: true,
        },
      },
    },
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

  // Get current user data before update
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!currentUser) {
    throw new Error("User not found");
  }

  // Update user role
  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  // Send email if user was pending and is now approved
  if (currentUser.role === "PENDING" && newRole !== "PENDING") {
    await sendEmail({
      to: [currentUser.email],
      subject: "Your Account Has Been Approved",
      react: (
        <RoleChangeEmail
          firstName={currentUser.name.split(" ")[0]}
          newRole={newRole}
        />
      ),
    });
  }

  revalidatePath("/admin/users");
}

export default async function UsersPage() {
  const authUser = await getAuthUser();
  if (!isAdmin(authUser)) {
    redirect("/");
  }

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
