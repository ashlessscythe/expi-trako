import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function NotificationListsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Notification Lists</CardTitle>
        <CardDescription>
          Configure email notification lists for plant-specific requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/admin/notification-lists">
          <Button>Manage Lists</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
