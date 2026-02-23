
import { db } from "../src/db";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

async function main() {
    try {
        // Dynamic import to ensure env is loaded first
        const { db } = await import("../src/db");

        console.log("Checking columns for table 'templates'...");
        const result = await db.execute(sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'templates';
        `);

        console.log(JSON.stringify(result.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error("Check failed:", err);
        process.exit(1);
    }
}

main();
