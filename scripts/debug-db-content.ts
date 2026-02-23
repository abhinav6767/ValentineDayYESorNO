
import { db } from "../src/db";
import { templates, pages } from "../src/db/schema";
import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });

async function main() {
    try {
        // Dynamic import to ensure env is loaded first
        const { db } = await import("../src/db");

        console.log("--- TEMPLATES ---");
        const allTemplates = await db.select().from(templates);
        console.log(JSON.stringify(allTemplates, null, 2));

        console.log("\n--- PAGES ---");
        const allPages = await db.select().from(pages);
        console.log(JSON.stringify(allPages, null, 2));

        process.exit(0);
    } catch (err) {
        console.error("Debug failed:", err);
        process.exit(1);
    }
}

main();
