import { faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";

/**
 * Generates a unique authorization number for requests
 * @param tx Prisma transaction client to ensure uniqueness check is part of transaction
 * @param length Length of the authorization number (default: 10)
 * @param maxAttempts Maximum number of attempts to generate a unique number (default: 10)
 * @returns Promise resolving to a unique authorization number
 * @throws Error if unable to generate a unique number within maxAttempts
 */
export async function generateUniqueAuthNumber(
  tx: Prisma.TransactionClient,
  length: number = 10,
  maxAttempts: number = 10
): Promise<string> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const authNumber = faker.string.alphanumeric(length).toUpperCase();

    // Check if this number already exists
    const existing = await tx.mustGoRequest.findFirst({
      where: { authorizationNumber: authNumber },
    });

    if (!existing) {
      return authNumber;
    }

    attempts++;
  }

  throw new Error(
    "Failed to generate unique authorization number after maximum attempts"
  );
}
