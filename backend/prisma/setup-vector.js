

import prisma from "../config/prisma.js";

async function setupVector() {
    console.log("Setting up pgvector extension and embedding column...\n");

    try {
         // Enable pgvector in PostgreSQL
        await prisma.$executeRawUnsafe(
            `CREATE EXTENSION IF NOT EXISTS vector;`
        );
        console.log("✅ pgvector extension enabled");

        // ─── Step 2: Add the embedding column to the chunks table ──────────────
        // "vector(768)" means: an array of exactly 768 floating-point numbers.
        // This number (768) must match the outputDimensionality in textChunker.js.
        //
        
        await prisma.$executeRawUnsafe(
            `ALTER TABLE chunks ADD COLUMN IF NOT EXISTS embedding vector(768);`
        );
        console.log("✅ embedding column added to chunks table (vector(768))");

        // Create an index for faster vector similarity search
        await prisma.$executeRawUnsafe(`
            CREATE INDEX IF NOT EXISTS chunks_embedding_hnsw_idx
            ON chunks
            USING hnsw (embedding vector_cosine_ops);
        `);
        console.log("✅ HNSW index created on chunks.embedding");

        console.log("\n🎉 pgvector setup complete! Your database is ready for AI embeddings.");
    } catch (error) {
        console.error("❌ Setup failed:", error.message);
        process.exit(1);
    } finally {
        // Always disconnect cleanly — important for scripts that exit after running
        await prisma.$disconnect();
    }
}

setupVector();
