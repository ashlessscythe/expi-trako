-- CreateEnum
CREATE TYPE "PartNumberStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED', 'ON_HOLD');

-- AlterTable
ALTER TABLE "PartDetail" ADD COLUMN     "status" "PartNumberStatus" NOT NULL DEFAULT 'PENDING';
