-- CreateEnum
CREATE TYPE "ApprovalLevel" AS ENUM ('LEVEL1', 'LEVEL2', 'LEVEL3', 'LEVEL4', 'LEVEL5', 'LEVEL6');

-- AlterTable
ALTER TABLE "PlantNotificationList" ADD COLUMN     "emailLevels" JSONB;
