
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { RoleSelect } from "@/components/admin/role-select";
import { UserEditModal } from "@/components/admin/user-edit-modal";
import { User } from "@prisma/client"

interface UserCardProps {
  user: User;
  onRoleChange: (formData: FormData) => Promise<void>;
  onUpdate: () => void;
}

export function UserCard({ user, onRoleChange, onUpdate }: UserCardProps) {
  return (
    <Card key={user.id} className="mb-4">
      <CardHeader>
        <h3 className="text-lg font-medium">{user.name}</h3>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Role:</span>
          <RoleSelect userId={user.id} currentRole={user.role} onRoleChange={onRoleChange} />
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Joined:</span>
          <span>{new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-end">
          <UserEditModal user={user} onUpdate={onUpdate} />
        </div>
      </CardContent>
    </Card>
  );
}
