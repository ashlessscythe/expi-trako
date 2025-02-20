import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { RoleSelect } from "@/components/admin/role-select";
import { UserEditModal } from "@/components/admin/user-edit-modal";
import { User } from "@/lib/types/user";
import { Site } from "@prisma/client";

interface UserCardProps {
  user: User;
  sites: Site[];
  onRoleChange: (formData: FormData) => Promise<void>;
  onUpdate: () => void;
}

export function UserCard({
  user,
  sites,
  onRoleChange,
  onUpdate,
}: UserCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toISOString().split("T")[0];
  };

  const renderSites = (user: User) => {
    const userSites = [
      ...(user.userSites?.map((us) => us.site) || []),
      ...(user.site ? [user.site] : []),
    ];
    // Remove duplicates based on site id
    const uniqueSites = Array.from(
      new Map(userSites.map((site) => [site.id, site])).values()
    );

    return uniqueSites.length > 0
      ? uniqueSites
          .map((site) => `${site.name} (${site.locationCode})`)
          .join(", ")
      : "No sites assigned";
  };

  return (
    <Card key={user.id} className="mb-4">
      <CardHeader>
        <h3 className="text-lg font-medium">{user.name}</h3>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Sites:</span>
          <span className="text-right">{renderSites(user)}</span>
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
          <UserEditModal user={user} sites={sites} onUpdate={onUpdate} />
        </div>
      </CardContent>
    </Card>
  );
}
