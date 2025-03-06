-- AlterTable
ALTER TABLE "RequestTrailer" ADD COLUMN     "plant" TEXT;

-- Populate the new plant field with the value from the parent MustGoRequest
UPDATE "RequestTrailer" rt
SET "plant" = mr."plant"
FROM "MustGoRequest" mr
WHERE rt."requestId" = mr."id" AND mr."plant" IS NOT NULL;
