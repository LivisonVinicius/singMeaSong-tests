import { prisma } from "../database.js";

export default async function reset() {
  await prisma.$executeRaw`TRUNCATE recommendations`;
}
