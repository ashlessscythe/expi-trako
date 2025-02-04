import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotesCardProps } from "./types";

export function NotesCard({ notes }: NotesCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notes.length > 0 ? (
            notes.map((note: string, index: number) => (
              <div key={index} className="bg-muted p-3 rounded">
                {note}
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">No notes yet</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
