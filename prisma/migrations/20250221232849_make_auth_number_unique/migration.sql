-- First, update any NULL or empty auth numbers with unique values
WITH RECURSIVE generate_auth_numbers AS (
  SELECT 
    id,
    UPPER(
      SUBSTRING(
        MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) 
        FROM 1 FOR 10
      )
    ) as new_auth_number
  FROM "MustGoRequest"
  WHERE "authorizationNumber" IS NULL OR "authorizationNumber" = ''
)
UPDATE "MustGoRequest" r
SET "authorizationNumber" = g.new_auth_number
FROM generate_auth_numbers g
WHERE r.id = g.id;

-- Make the column required and unique
ALTER TABLE "MustGoRequest" 
  ALTER COLUMN "authorizationNumber" SET NOT NULL,
  ADD CONSTRAINT "MustGoRequest_authorizationNumber_key" UNIQUE ("authorizationNumber");
