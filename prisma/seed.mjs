import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option("destructive", {
    type: "boolean",
    description: "Allow destructive operations (clear/clear-data)",
    default: false,
  })
  .option("clear", {
    type: "boolean",
    description:
      "Clear all existing data including users before seeding (requires --destructive)",
    default: false,
  })
  .option("clear-data", {
    type: "boolean",
    description:
      "Clear all data except users before seeding (requires --destructive)",
    default: false,
  })
  .option("use-faker", {
    type: "boolean",
    description: "Use faker to generate realistic data",
    default: false,
  })
  .option("count", {
    type: "number",
    description: "Number of records to generate",
    default: 5,
  })
  .option("multiplier", {
    type: "number",
    description:
      "Multiplier for request count (defaults to 5 when count is 10)",
  })
  .option("add-request", {
    type: "number",
    description: "Number of additional requests to add to existing database",
  })
  .option("noreq", {
    type: "boolean",
    description: "Skip request creation, only create default site and users",
    default: false,
  })
  .check((argv) => {
    if ((argv.clear || argv["clear-data"]) && !argv.destructive) {
      throw new Error("Destructive operations require --destructive flag");
    }
    return true;
  })
  .parse();

const roles = [
  "ADMIN",
  "CUSTOMER_SERVICE",
  "WAREHOUSE",
  "REPORT_RUNNER",
  "PENDING",
];

const requestStatuses = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "IN_PROGRESS",
  "LOADING",
  "IN_TRANSIT",
  "ARRIVED",
  "COMPLETED",
  "ON_HOLD",
  "CANCELLED",
  "FAILED",
];

const itemStatuses = [
  "PENDING",
  "IN_PROGRESS",
  "IN_TRANSIT",
  "COMPLETED",
  "CANCELED",
  "ON_HOLD",
];

const rolePasswords = {
  ADMIN: "adminpass",
  CUSTOMER_SERVICE: "cspass",
  WAREHOUSE: "whpass",
  REPORT_RUNNER: "rrpass",
  PENDING: "pendingpass",
};

// Helper function to generate random dates for the specified number of days
function generateDates(dayCount, maxRequestsPerDay = 5) {
  const now = new Date();
  const twoMonthsAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 2,
    now.getDate()
  );

  // Get array of random days
  const days = [];
  const totalDays = Math.floor((now - twoMonthsAgo) / (1000 * 60 * 60 * 24));
  const selectedDays = new Set();

  while (selectedDays.size < dayCount) {
    const randomDay = faker.number.int({ min: 0, max: totalDays });
    selectedDays.add(randomDay);
  }

  // For each selected day, generate 1 to maxRequestsPerDay timestamps during business hours
  const dayRequestCounts = new Map(); // Track requests per day
  selectedDays.forEach((dayOffset) => {
    const date = new Date(twoMonthsAgo);
    date.setDate(date.getDate() + dayOffset);

    // Generate between 1 and maxRequestsPerDay requests for this day
    const requestCount = faker.number.int({ min: 1, max: maxRequestsPerDay });
    const dateStr = date.toISOString().split("T")[0];
    dayRequestCounts.set(dateStr, requestCount);

    for (let i = 0; i < requestCount; i++) {
      const hour = faker.number.int({ min: 6, max: 18 });
      const minute = faker.number.int({ min: 0, max: 59 });
      const second = faker.number.int({ min: 0, max: 59 });

      const timestamp = new Date(date);
      timestamp.setHours(hour, minute, second, 0);
      days.push(timestamp);
    }
  });

  // Sort chronologically and log request counts
  console.log("\nRequests per day:");
  Array.from(dayRequestCounts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([date, count]) => {
      console.log(`${date}: ${count} requests`);
    });

  return days.sort((a, b) => a - b);
}

// Helper function to generate realistic part number with quantity
function generatePartWithQuantity() {
  // Generate 5-6 digit part number
  const partNumber = faker.number.int({ min: 10000, max: 999999 }).toString();

  // Generate quantity that's a multiple of 24 (between 24 and 240)
  const quantity = faker.number.int({ min: 1, max: 10 }) * 24;

  return { partNumber, quantity };
}

// Helper function to generate trailer number
function generateTrailerNumber() {
  const prefix = faker.helpers.arrayElement(["SL", "ST", "B"]);
  const number = faker.number.int({ min: 10000, max: 99999 });
  return `${prefix}${number}`;
}

// Helper function to generate realistic notes
function generateNote() {
  const noteTypes = [
    () =>
      `${faker.word.adjective()} delivery needed by ${faker.date
        .future()
        .toLocaleDateString()}`,
    () =>
      `Customer ${faker.person.lastName()} waiting at dock ${faker.number.int({
        min: 1,
        max: 50,
      })}`,
    () =>
      `Temperature sensitive - maintain at ${faker.number.int({
        min: 35,
        max: 75,
      })}°F`,
    () =>
      `Lift gate required for ${faker.number.int({ min: 1, max: 5 })} pallets`,
    () =>
      `Contact ${faker.person.fullName()} at ${faker.phone.number()} before delivery`,
    () => `Special handling required - ${faker.commerce.productMaterial()}`,
    () => `Priority level ${faker.number.int({ min: 1, max: 5 })} shipment`,
    () => `Dock ${faker.number.int({ min: 1, max: 50 })} assignment only`,
  ];

  return faker.helpers.arrayElement(noteTypes)();
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function clearDatabase() {
  console.log("Clearing all database data including users and sites...");
  // Delete in correct order to handle foreign key constraints
  await prisma.requestLog.deleteMany();
  await prisma.partDetail.deleteMany();
  await prisma.requestTrailer.deleteMany();
  await prisma.trailer.deleteMany();
  await prisma.mustGoRequest.deleteMany();
  await prisma.user.deleteMany();
  await prisma.site.deleteMany();
  console.log("Database cleared completely");
}

async function clearDataExceptUsers() {
  console.log("Clearing all data while preserving users and sites...");
  await prisma.requestLog.deleteMany();
  await prisma.partDetail.deleteMany();
  await prisma.requestTrailer.deleteMany();
  await prisma.trailer.deleteMany();
  await prisma.mustGoRequest.deleteMany();
  console.log("Database data cleared (users and sites preserved)");
}

async function generateBasicData(count, useFaker) {
  // Create default users with unique emails
  const defaultUsers = [
    {
      name: "joe",
      email: "joe@joe.joe",
      password: await hashPassword("cspass"),
      role: "CUSTOMER_SERVICE",
    },
    {
      name: "alice",
      email: "alice@alice.alice",
      password: await hashPassword("whpass"),
      role: "WAREHOUSE",
    },
    {
      name: "Bob",
      email: "bob@bob.bob",
      password: await hashPassword("adminpass"),
      role: "ADMIN",
    },
  ];

  // Track used emails to ensure uniqueness
  const usedEmails = new Set(defaultUsers.map((user) => user.email));

  const generateUniqueEmail = () => {
    let email;
    do {
      email = useFaker
        ? faker.internet.email()
        : `user${faker.number.int(9999)}@example.com`;
    } while (usedEmails.has(email));
    usedEmails.add(email);
    return email;
  };

  const additionalUsers = await Promise.all(
    Array.from({ length: count }, async () => {
      const role = roles[Math.floor(Math.random() * roles.length)];
      return {
        name: useFaker
          ? faker.person.fullName()
          : `User ${faker.number.int(999)}`,
        email: generateUniqueEmail(),
        password: await hashPassword(rolePasswords[role]),
        role,
      };
    })
  );

  return { users: [...defaultUsers, ...additionalUsers] };
}

async function ensureDefaultSite() {
  console.log("Ensuring default site exists...");
  const defaultSite = await prisma.site.upsert({
    where: { locationCode: "DEFAULT" },
    update: {},
    create: {
      locationCode: "DEFAULT",
      name: "Default Site",
      isActive: true,
    },
  });
  console.log("Default site ready:", defaultSite.id);
  return defaultSite;
}

async function associateWithDefaultSite(defaultSite) {
  // First handle users without site
  // Get all users without a site
  const usersWithoutSite = await prisma.user.findMany({
    where: { siteId: null },
  });

  let userUpdateCount = 0;
  if (usersWithoutSite.length > 0) {
    console.log(
      `Found ${usersWithoutSite.length} users without site association`
    );

    // Check for email conflicts in default site
    const existingEmails = await prisma.user.findMany({
      where: {
        siteId: defaultSite.id,
        email: { in: usersWithoutSite.map((u) => u.email) },
      },
      select: { email: true },
    });
    const existingEmailSet = new Set(existingEmails.map((u) => u.email));

    // Update users without site, skipping those with email conflicts
    const updates = await Promise.all(
      usersWithoutSite.map(async (user) => {
        if (!existingEmailSet.has(user.email)) {
          await prisma.user.update({
            where: { id: user.id },
            data: { siteId: defaultSite.id },
          });
          return true;
        } else {
          console.log(
            `Skipping user ${user.email} - email already exists in default site`
          );
          return false;
        }
      })
    );

    userUpdateCount = updates.filter(Boolean).length;
    console.log(`Associated ${userUpdateCount} users with default site`);
  }

  // Then handle requests without site
  const requestsWithoutSite = await prisma.mustGoRequest.findMany({
    where: { siteId: null },
  });

  let requestUpdateCount = 0;
  if (requestsWithoutSite.length > 0) {
    console.log(
      `Found ${requestsWithoutSite.length} requests without site association`
    );

    // Update all requests without site to use default site
    await prisma.mustGoRequest.updateMany({
      where: { siteId: null },
      data: { siteId: defaultSite.id },
    });

    requestUpdateCount = requestsWithoutSite.length;
    console.log(`Associated ${requestUpdateCount} requests with default site`);
  }

  return { userUpdateCount, requestUpdateCount };
}

async function main() {
  console.log("Starting seed...");

  let defaultSite;
  let createdUsers;

  // First check if we have any existing data
  const existingUserCount = await prisma.user.count();
  const hasExistingData = existingUserCount > 0;

  console.log(`Found ${existingUserCount} existing users`);

  // Ensure default site exists first in all cases
  defaultSite = await ensureDefaultSite();

  if (argv.clear && argv.destructive) {
    await clearDatabase();
    defaultSite = await ensureDefaultSite();

    // Generate new users
    const { users } = await generateBasicData(argv.count, argv.useFaker);
    createdUsers = await Promise.all(
      users.map((user) =>
        prisma.user.create({
          data: {
            ...user,
            siteId: defaultSite.id,
          },
        })
      )
    );
  } else if (argv["clear-data"] && argv.destructive) {
    await clearDataExceptUsers();
    // Associate existing users with default site
    await associateWithDefaultSite(defaultSite);
    createdUsers = await prisma.user.findMany();
  } else if (argv["add-request"] !== undefined) {
    // When adding requests, use existing users
    createdUsers = await prisma.user.findMany();
    console.log(`Using ${createdUsers.length} existing users for new requests`);
    await associateWithDefaultSite(defaultSite);
  } else if (hasExistingData) {
    // Non-destructive mode with existing data
    console.log("Running in non-destructive mode");
    await associateWithDefaultSite(defaultSite);
    createdUsers = await prisma.user.findMany();
  } else {
    // Fresh database, create initial data
    console.log("No existing data found, creating initial dataset");
    const { users } = await generateBasicData(argv.count, argv.useFaker);
    createdUsers = await Promise.all(
      users.map((user) =>
        prisma.user.create({
          data: {
            ...user,
            siteId: defaultSite.id,
          },
        })
      )
    );
  }
  // Log appropriate message based on operation
  if (argv.clear && argv.destructive) {
    console.log(
      `Created ${createdUsers.length} users (including default bob@bob.bob)`
    );
  } else if (hasExistingData) {
    console.log(`Using ${createdUsers.length} existing users`);
  } else {
    console.log(
      `Created ${createdUsers.length} users (including default bob@bob.bob)`
    );
  }

  // Skip request creation if --noreq flag is present
  if (!argv.noreq) {
    // Create must-go requests with trailers and parts
    const requests = [];

    // Generate dates for the specified number of days with max requests per day
    const dayCount =
      argv["add-request"] !== undefined ? argv["add-request"] : argv.count;
    const maxRequestsPerDay = argv.multiplier || 5; // Default to 5 requests per day max
    const dates = generateDates(dayCount, maxRequestsPerDay);

    // Create requests for each timestamp
    for (const createdAt of dates) {
      // Generate 1-3 parts with quantities
      const partCount = faker.number.int({ min: 1, max: 3 });
      const selectedParts = Array.from(
        { length: partCount },
        generatePartWithQuantity
      );

      // Calculate total pallet count based on quantities
      const totalPalletCount = selectedParts.reduce((acc, part) => {
        return acc + Math.ceil(part.quantity / 24);
      }, 0);

      // Generate 1-3 random notes
      const noteCount = faker.number.int({ min: 1, max: 3 });
      const selectedNotes = Array.from({ length: noteCount }, generateNote);

      // Create trailer first
      const trailer = await prisma.trailer.create({
        data: {
          trailerNumber: generateTrailerNumber(),
          createdAt,
          updatedAt: createdAt,
        },
      });

      // Create request
      const request = await prisma.mustGoRequest.create({
        data: {
          shipmentNumber: faker.string.alphanumeric({
            length: 10,
            casing: "upper",
          }),
          siteId: defaultSite.id,
          plant: faker.helpers.arrayElement(["FS22", "PL45", "WH23", "DK89"]),
          palletCount: totalPalletCount,
          status:
            requestStatuses[Math.floor(Math.random() * requestStatuses.length)],
          routeInfo: faker.location.streetAddress(),
          additionalNotes: selectedNotes.join(" | "),
          notes: selectedNotes,
          createdBy:
            createdUsers[Math.floor(Math.random() * createdUsers.length)].id,
          trailers: {
            create: {
              trailer: {
                connect: {
                  id: trailer.id,
                },
              },
              isTransload: Math.random() < 0.5, // 50% chance
              status:
                itemStatuses[Math.floor(Math.random() * itemStatuses.length)],
              createdAt,
            },
          },
          createdAt,
          updatedAt: createdAt,
        },
      });

      // Create part details linked to both request and trailer
      const parts = await Promise.all(
        selectedParts.map((part) =>
          prisma.partDetail.create({
            data: {
              partNumber: part.partNumber,
              quantity: part.quantity,
              request: {
                connect: {
                  id: request.id,
                },
              },
              trailer: {
                connect: {
                  id: trailer.id,
                },
              },
              status:
                itemStatuses[Math.floor(Math.random() * itemStatuses.length)],
              createdAt,
              updatedAt: createdAt,
            },
          })
        )
      );

      // Create initial log
      await prisma.requestLog.create({
        data: {
          mustGoRequestId: request.id,
          action: `Request created with ${parts.length} part number(s)`,
          performedBy:
            createdUsers[Math.floor(Math.random() * createdUsers.length)].id,
          timestamp: createdAt,
        },
      });

      requests.push({ ...request, parts });
    }
    console.log(
      `Created ${requests.length} must-go requests with trailers and parts`
    );
  } else {
    console.log("Skipping request creation (--noreq flag present)");
  }

  console.log("Seed completed successfully");

  if (!argv["clear-data"] && argv["add-request"] === undefined) {
    console.log("\nDefault user created:");
    console.log("Email: bob@bob.bob");
    console.log("Password: adminpass");
    console.log("\nRole-specific passwords:");
    Object.entries(rolePasswords).forEach(([role, pass]) => {
      console.log(`${role}: ${pass}`);
    });
  }
}

main()
  .catch((error) => {
    console.error("Error during seeding:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
