import prisma from "@/lib/prisma";
import { ApprovalLevel } from "@prisma/client";

// Define the approval levels as string constants
export const APPROVAL_LEVELS = {
  LEVEL1: "LEVEL1", // PC Manager (0-$250)
  LEVEL2: "LEVEL2", // Plant Controller ($250-$500)
  LEVEL3: "LEVEL3", // Plant Manager ($500-$1,000)
  LEVEL4: "LEVEL4", // Regional Controller ($1,000-$2,000)
  LEVEL5: "LEVEL5", // Regional Operations ($2,000-$5,000)
  LEVEL6: "LEVEL6", // Operations Director (>$5,000)
};

export async function getPlantNotificationEmails(
  siteId: string,
  plant: string, // Will convert to uppercase
  levels?: ApprovalLevel[] // Optional levels to filter by
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

    // If notifications are not enabled or list doesn't exist, return empty array
    if (!notificationList?.enabled) {
      return [];
    }

    // If no levels are specified or emailLevels is not set, return all emails
    if (!levels || !notificationList.emailLevels) {
      return notificationList.emails || [];
    }

    // Filter emails by level
    const emailLevels = notificationList.emailLevels as Record<string, string>;
    const filteredEmails = notificationList.emails.filter((email) => {
      const emailLevel = emailLevels[email];
      // Skip emails with no level or "NONE" level
      return (
        emailLevel &&
        emailLevel !== "NONE" &&
        levels.includes(emailLevel as ApprovalLevel)
      );
    });

    return filteredEmails;
  } catch (error) {
    console.error("Error fetching notification list:", error);
    return [];
  }
}

// Helper function to get the level name for display
export function getLevelName(level: ApprovalLevel | "NONE"): string {
  switch (level) {
    case "LEVEL1":
      return "PC Manager (0-$250)";
    case "LEVEL2":
      return "Plant Controller ($250-$500)";
    case "LEVEL3":
      return "Plant Manager ($500-$1,000)";
    case "LEVEL4":
      return "Regional Controller ($1,000-$2,000)";
    case "LEVEL5":
      return "Regional Operations ($2,000-$5,000)";
    case "LEVEL6":
      return "Operations Director (>$5,000)";
    case "NONE":
      return "No Level";
    default:
      return "Unknown Level";
  }
}

// Helper function to get the level based on cost
export function getLevelsForCost(cost: number): ApprovalLevel[] {
  const levels: ApprovalLevel[] = [];

  if (cost > 0) {
    levels.push("LEVEL1" as ApprovalLevel); // PC Manager (0-$250)
  }

  if (cost > 250) {
    levels.push("LEVEL2" as ApprovalLevel); // Plant Controller ($250-$500)
  }

  if (cost > 500) {
    levels.push("LEVEL3" as ApprovalLevel); // Plant Manager ($500-$1,000)
  }

  if (cost > 1000) {
    levels.push("LEVEL4" as ApprovalLevel); // Regional Controller ($1,000-$2,000)
  }

  if (cost > 2000) {
    levels.push("LEVEL5" as ApprovalLevel); // Regional Operations ($2,000-$5,000)
  }

  if (cost > 5000) {
    levels.push("LEVEL6" as ApprovalLevel); // Operations Director (>$5,000)
  }

  return levels;
}
