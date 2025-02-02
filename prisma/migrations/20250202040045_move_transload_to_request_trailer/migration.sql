-- First add the new column to RequestTrailer
ALTER TABLE "RequestTrailer" ADD COLUMN "isTransload" BOOLEAN NOT NULL DEFAULT false;

-- Copy the isTransload value from Trailer to all associated RequestTrailer records
UPDATE "RequestTrailer"
SET "isTransload" = t."isTransload"
FROM "Trailer" t
WHERE t.id = "RequestTrailer"."trailerId";

-- Finally remove the column from Trailer
ALTER TABLE "Trailer" DROP COLUMN "isTransload";
