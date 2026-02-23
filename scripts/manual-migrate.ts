
import { db } from "../src/db";
import { sql } from "drizzle-orm";
// We need to load env vars because src/db/index.ts relies on them.
// We'll try standard dotenv flow.
import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true }); // .env.local overrides .env usually

async function main() {
    console.log("Running manual migration...");
    try {
        await db.execute(sql`ALTER TABLE templates ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true`);
        console.log("Added is_public column.");

        await db.execute(sql`ALTER TABLE templates ADD COLUMN IF NOT EXISTS fields jsonb`);
        console.log("Added fields column.");

        await db.execute(sql`ALTER TABLE templates ALTER COLUMN price SET DEFAULT 0`);
        await db.execute(sql`ALTER TABLE templates ALTER COLUMN price SET NOT NULL`);

        // Update existing nulls?
        await db.execute(sql`UPDATE templates SET price = 0 WHERE price IS NULL`);

        console.log("Migration complete.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

main();
