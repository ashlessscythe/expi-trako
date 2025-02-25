-- CreateTable
CREATE TABLE "PlantNotificationList" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "plant" TEXT NOT NULL,
    "emails" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlantNotificationList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlantNotificationList_siteId_idx" ON "PlantNotificationList"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "PlantNotificationList_siteId_plant_key" ON "PlantNotificationList"("siteId", "plant");

-- AddForeignKey
ALTER TABLE "PlantNotificationList" ADD CONSTRAINT "PlantNotificationList_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
