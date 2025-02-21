"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RoleSelect } from "@/components/admin/role-select";
import { UserEditModal } from "@/components/admin/user-edit-modal";
import { UserCard } from "@/components/admin/user-card";
import { useRouter } from "next/navigation";
import { Role, Site } from "@prisma/client";
import { renderSites } from "@/hooks/userInfo";
import { User } from "@/lib/types/user";

interface UsersTableProps {
  users: User[];
  sites: Site[];
  onRoleChange: (formData: FormData) => Promise<void>;
}

export function UsersTable({ users, sites, onRoleChange }: UsersTableProps) {
  const router = useRouter();

  const handleUpdate = () => {
    router.refresh();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toISOString().split("T")[0];
  };

  const renderUserCard = (user: User) => (
    <UserCard
      key={user.id}
      user={user}
      onRoleChange={onRoleChange}
      onUpdate={handleUpdate}
      sites={sites}
    />
  );

  return (
    <>
      {/* Mobile View (cards) */}
      <div className="md:hidden space-y-4">{users.map(renderUserCard)}</div>

      {/* Desktop table view */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10 border-b">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Sites</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{renderSites(user)}</TableCell>
                <TableCell>
                  <RoleSelect
                    userId={user.id}
                    currentRole={user.role}
                    onRoleChange={onRoleChange}
                  />
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell>
                  <UserEditModal
                    user={user}
                    sites={sites}
                    onUpdate={handleUpdate}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
