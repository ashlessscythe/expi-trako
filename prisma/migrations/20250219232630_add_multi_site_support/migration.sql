/*
  Warnings:

  - A unique constraint covering the columns `[email,siteId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "MustGoRequest" ADD COLUMN     "siteId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "siteId" TEXT;

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "locationCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- Create default site first
INSERT INTO "Site" ("id", "locationCode", "name", "isActive", "createdAt", "updatedAt")
VALUES ('default-site', 'DEFAULT', 'Default Site', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Associate existing users with default site
UPDATE "User" SET "siteId" = 'default-site' WHERE "siteId" IS NULL;

-- Associate existing requests with default site
UPDATE "MustGoRequest" SET "siteId" = 'default-site' WHERE "siteId" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Site_locationCode_key" ON "Site"("locationCode");

-- CreateIndex
CREATE INDEX "MustGoRequest_siteId_idx" ON "MustGoRequest"("siteId");

-- CreateIndex
CREATE INDEX "User_siteId_idx" ON "User"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_siteId_key" ON "User"("email", "siteId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MustGoRequest" ADD CONSTRAINT "MustGoRequest_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE SET NULL ON UPDATE CASCADE;
