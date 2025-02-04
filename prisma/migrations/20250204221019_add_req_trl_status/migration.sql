/*
  Warnings:

  - The `status` column on the `PartDetail` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED', 'ON_HOLD');

-- AlterTable
ALTER TABLE "PartDetail" DROP COLUMN "status",
ADD COLUMN     "status" "ItemStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "RequestTrailer" ADD COLUMN     "status" "ItemStatus" NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "PartNumberStatus";
