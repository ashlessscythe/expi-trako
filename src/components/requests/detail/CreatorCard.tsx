import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreatorCardProps } from "./types";

export function CreatorCard({
  creator,
  createdAt,
  deleted,
  deletedAt,
}: CreatorCardProps) {
  return (
    <Card className="lg:h-fit">
      <CardHeader>
        <CardTitle>Created By</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
        <div>
          <div className="text-sm text-muted-foreground">Name</div>
          <div className="font-medium">{creator.name}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Role</div>
          <div className="font-medium">{creator.role}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Date</div>
          <div className="font-medium">
            {new Date(createdAt).toLocaleString()}
          </div>
        </div>
        {deleted && deletedAt && (
          <div>
            <div className="text-sm text-muted-foreground">Deleted At</div>
            <div className="font-medium text-destructive">
              {new Date(deletedAt).toLocaleString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
