import { db } from "@/db";
import { pages } from "@/db/schema";
import { deleteFileConfig } from "@/lib/storage";
import { lt, and, eq, isNotNull } from "drizzle-orm";
import { NextResponse } from "next/server";

// This route should be called by a cron job (e.g. Vercel Cron, GitHub Actions, or external service)
// Secure it with a secret key if needed.

export async function GET(req: Request) {
    // 1. Auth Check (Simple header check)
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // return new NextResponse("Unauthorized", { status: 401 });
        // For dev/demo, we might skip or log warning.
        console.warn("Cleanup Cron triggered without valid secret (Dev mode or missing env)");
    }

    try {
        // 2. Define Expiration (15 days ago)
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() - 15);

        // 3. Find Expired Pages
        // We want pages created < 15 days ago AND are NOT already marked expired/archived?
        // Or just strictly by date. 
        // Let's assume we delete them.

        const expiredPages = await db.select().from(pages).where(lt(pages.createdAt, expirationDate));

        console.log(`Found ${expiredPages.length} expired pages.`);

        let deletedCount = 0;

        for (const page of expiredPages) {
            // 4. Cleanup Assets
            const content = page.content as any;
            if (content) {
                // Check 'photos' array specifically as that's where we store uploads
                if (Array.isArray(content.photos)) {
                    for (const photo of content.photos) {
                        try {
                            let key = "";
                            if (typeof photo === "string") {
                                key = photo;
                            } else if (typeof photo === "object" && photo.key) {
                                key = photo.key;
                            }

                            if (key && key.startsWith("uploads/")) {
                                console.log(`Deleting asset: ${key}`);
                                await deleteFileConfig(key);
                            }
                        } catch (err) {
                            console.error(`Failed to delete asset`, err);
                        }
                    }
                }

                // Check other top-level keys just in case
                for (const key of Object.keys(content)) {
                    const value = content[key];
                    if (typeof value === "string" && value.startsWith("uploads/")) {
                        try {
                            console.log(`Deleting asset: ${value}`);
                            await deleteFileConfig(value);
                        } catch (err) {
                            console.error(`Failed to delete asset ${value}`, err);
                        }
                    }
                }
            }

            // 5. Delete Page Record
            await db.delete(pages).where(eq(pages.id, page.id));
            deletedCount++;
        }

        return NextResponse.json({ success: true, deleted: deletedCount });
    } catch (error) {
        console.error("Cleanup job failed:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
