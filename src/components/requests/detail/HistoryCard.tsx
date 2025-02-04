import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HistoryCardProps } from "./types";

export function HistoryCard({ logs }: HistoryCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start justify-between border-b pb-4 last:border-0"
            >
              <div>
                <div className="font-medium">{log.action}</div>
                <div className="text-sm text-muted-foreground">
                  By {log.performer.name} ({log.performer.role})
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
