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
  userId: string,
  length: number = 10,
  maxAttempts: number = 10
): Promise<string> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const authNumber = faker.string.alphanumeric(length).toUpperCase();

    try {
      // Attempt to create a request with this auth number
      // If it fails due to uniqueness constraint, catch and try again
      await tx.mustGoRequest.create({
        data: {
          authorizationNumber: authNumber,
          // Add required fields with placeholder values that will be updated
          // in the actual request creation
          shipmentNumber: "TEMP",
          createdBy: userId,
          status: "PENDING",
          palletCount: 1, // Required field, using placeholder value
        },
      });

      // If successful, delete the temporary request
      await tx.mustGoRequest.delete({
        where: { authorizationNumber: authNumber },
      });

      return authNumber;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          // P2002 is Prisma's error code for unique constraint violation
          attempts++;
          continue;
        }
      }
      throw error; // Re-throw any other errors
    }
  }

  throw new Error(
    "Failed to generate unique authorization number after maximum attempts"
  );
}
