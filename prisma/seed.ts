import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

export const ADMIN_USERNAME = "admin";

async function main() {
  const existing = await db.user.findFirst({ where: { role: "admin" } });
  if (existing) {
    console.log(`Admin account already exists (${existing.email}); skipping.`);
    return;
  }
  await db.user.create({
    data: {
      email: ADMIN_USERNAME,
      name: "Admin",
      passwordHash: await bcrypt.hash("Admin@2007", 12),
      role: "admin",
      status: "active",
    },
  });
  console.log("Seeded admin account (username: Admin).");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
