
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

console.log("Checking DB Connection...");
const url = process.env.DATABASE_URL;
if (!url) {
    console.error("DATABASE_URL is undefined!");
    process.exit(1);
}

console.log("DATABASE_URL found:", url.replace(/:[^:]+@/, ":***@")); // Mask password

import { Client } from "pg";

const client = new Client({
    connectionString: url,
});

async function test() {
    try {
        await client.connect();
        console.log("Connected successfully!");
        const res = await client.query('SELECT NOW()');
        console.log("DB Time:", res.rows[0]);
        await client.end();
    } catch (err) {
        console.error("Connection failed:", err);
    }
}

test();
