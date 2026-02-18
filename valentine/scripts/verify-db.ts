
import { templates } from "../src/db/schema";
import { count } from "drizzle-orm";
import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
console.log(`Loading env from: ${envPath}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("Error loading .env.local:", result.error);
}

async function main() {
    try {
        // Dynamic import to ensure env is loaded first
        const { db } = await import("../src/db");

        const [result] = await db.select({ count: count() }).from(templates);
        console.log(`Templates count: ${result.count}`);
        process.exit(0);
    } catch (err) {
        console.error("Verification failed:", err);
        process.exit(1);
    }
}

main();
