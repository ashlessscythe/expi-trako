import prisma from "@/lib/prisma";

export async function getPlantNotificationEmails(
  siteId: string,
  plant: string // Will convert to uppercase
): Promise<string[]> {
  try {
    const notificationList = await prisma.plantNotificationList.findUnique({
      where: {
        siteId_plant: {
          siteId,
          plant: plant.toUpperCase(),
        },
      },
    });

    // Only return emails if notifications are enabled
    return (notificationList?.enabled ? notificationList.emails : []) || [];
  } catch (error) {
    console.error("Error fetching notification list:", error);
    return [];
  }
}
