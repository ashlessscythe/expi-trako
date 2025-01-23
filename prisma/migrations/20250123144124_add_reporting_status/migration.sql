/*
  Warnings:

  - The values [INFORMATIONAL] on the enum `RequestStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RequestStatus_new" AS ENUM ('PENDING', 'REPORTING', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'LOADING', 'IN_TRANSIT', 'ARRIVED', 'COMPLETED', 'ON_HOLD', 'CANCELLED', 'FAILED');
ALTER TABLE "MustGoRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "MustGoRequest" ALTER COLUMN "status" TYPE "RequestStatus_new" USING ("status"::text::"RequestStatus_new");
ALTER TYPE "RequestStatus" RENAME TO "RequestStatus_old";
ALTER TYPE "RequestStatus_new" RENAME TO "RequestStatus";
DROP TYPE "RequestStatus_old";
ALTER TABLE "MustGoRequest" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
