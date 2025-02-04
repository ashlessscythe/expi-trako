import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PartsTrailerGridProps } from "./types";

export function PartsTrailerGrid({
  partsByTrailer,
  trailers,
  partDetails,
}: PartsTrailerGridProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Parts by Trailer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-2">
          {Object.entries(partsByTrailer).map(
            ([trailerNumber, { isTransload, parts }]) => (
              <Card key={trailerNumber}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    Trailer: {trailerNumber}
                    {isTransload && (
                      <Badge variant="secondary">Transload</Badge>
                    )}
                    <Badge
                      variant={
                        (
                          trailers.find(
                            (t) => t.trailer.trailerNumber === trailerNumber
                          )?.status || "PENDING"
                        ).toLowerCase() as any
                      }
                    >
                      {trailers
                        .find((t) => t.trailer.trailerNumber === trailerNumber)
                        ?.status.replace("_", " ") || "PENDING"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {parts.map((part, index) => (
                      <div
                        key={index}
                        className="bg-muted px-2 py-1 rounded flex justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span>{part.partNumber}</span>
                          <Badge
                            variant={
                              (
                                partDetails.find(
                                  (p) => p.partNumber === part.partNumber
                                )?.status || "PENDING"
                              ).toLowerCase() as any
                            }
                          >
                            {partDetails
                              .find((p) => p.partNumber === part.partNumber)
                              ?.status.replace("_", " ") || "PENDING"}
                          </Badge>
                        </div>
                        <span className="text-muted-foreground">
                          Qty: {part.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
