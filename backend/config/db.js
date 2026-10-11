import prisma from "./prisma.js";

// Check whether the database is reachable
export const testConnection = async () => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log("PostgreSQL (NeonDB) connected successfully");
    } catch (err) {
        console.error("PostgreSQL connection error:", err.message);
        process.exit(1);
    }
};

export default testConnection;