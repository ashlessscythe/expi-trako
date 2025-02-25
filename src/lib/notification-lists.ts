import prisma from "@/lib/prisma";

export async function getPlantNotificationEmails(
  siteId: string,
  plant: string
): Promise<string[]> {
  try {
    const notificationList = await prisma.plantNotificationList.findUnique({
      where: {
        siteId_plant: {
          siteId,
          plant,
        },
      },
    });

    return notificationList?.emails || [];
  } catch (error) {
    console.error("Error fetching notification list:", error);
    return [];
  }
}
