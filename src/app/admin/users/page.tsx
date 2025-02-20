import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { UsersTable } from "@/components/admin/users-table";
import { getAuthUser, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sendEmail } from "@/lib/email";
import { RoleChangeEmail } from "@/components/role-change-email";

async function getData() {
  const [users, sites] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        site: {
          select: {
            id: true,
            name: true,
            locationCode: true,
          },
        },
        userSites: {
          include: {
            site: {
              select: {
                id: true,
                name: true,
                locationCode: true,
              },
            },
          },
        },
      },
    }),
    prisma.site.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return { users, sites };
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
    include: {
      site: {
        select: {
          id: true,
          name: true,
          locationCode: true,
        },
      },
      userSites: {
        include: {
          site: {
            select: {
              id: true,
              name: true,
              locationCode: true,
            },
          },
        },
      },
    },
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
          user={currentUser}
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

  const { users, sites } = await getData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">User Management</h2>
      </div>

      <UsersTable users={users} sites={sites} onRoleChange={updateUserRole} />
    </div>
  );
}
