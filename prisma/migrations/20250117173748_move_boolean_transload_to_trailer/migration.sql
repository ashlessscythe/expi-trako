/*
  Warnings:

  - You are about to drop the column `isTransload` on the `MustGoRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MustGoRequest" DROP COLUMN "isTransload";

-- AlterTable
ALTER TABLE "Trailer" ADD COLUMN     "isTransload" BOOLEAN NOT NULL DEFAULT false;
