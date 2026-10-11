import { PrismaClient } from "@prisma/client";

// Share one Prisma client across the backend
const prisma = new PrismaClient({
    // log: ["query", "warn", "error"],
});

export default prisma;