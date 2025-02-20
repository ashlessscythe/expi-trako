import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { RoleSelect } from "@/components/admin/role-select";
import { UserEditModal } from "@/components/admin/user-edit-modal";
import { User } from "@/lib/types/user";

interface UserCardProps {
  user: User;
  onRoleChange: (formData: FormData) => Promise<void>;
  onUpdate: () => void;
}

export function UserCard({ user, onRoleChange, onUpdate }: UserCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toISOString().split("T")[0];
  };

  return (
    <Card key={user.id} className="mb-4">
      <CardHeader>
        <h3 className="text-lg font-medium">{user.name}</h3>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Site:</span>
          <span>
            {user.site
              ? `${user.site.name} (${user.site.locationCode})`
              : "No site assigned"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Role:</span>
          <RoleSelect
            userId={user.id}
            currentRole={user.role}
            onRoleChange={onRoleChange}
          />
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Joined:</span>
          <span>{formatDate(user.createdAt)}</span>
        </div>
        <div className="flex justify-end">
          <UserEditModal user={user} onUpdate={onUpdate} />
        </div>
      </CardContent>
    </Card>
  );
}
