// Seed script — populated in Step 5
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database…");
  // Doctor user, services, and availability rules added in Step 5
  console.log("Done.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
