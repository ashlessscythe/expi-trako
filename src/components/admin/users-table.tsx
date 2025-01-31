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
import { useRouter } from "next/navigation";
import { Role } from "@prisma/client";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
}

interface UsersTableProps {
  users: User[];
  onRoleChange: (formData: FormData) => Promise<void>;
}

export function UsersTable({ users, onRoleChange }: UsersTableProps) {
  const router = useRouter();

  const handleUpdate = () => {
    router.refresh();
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
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
              <TableCell>
                <RoleSelect
                  userId={user.id}
                  currentRole={user.role}
                  onRoleChange={onRoleChange}
                />
              </TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <UserEditModal user={user} onUpdate={handleUpdate} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
