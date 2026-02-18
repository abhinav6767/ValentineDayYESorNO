import { db } from "@/db";
import { templates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    // Update Valentine template: add tags and sale price
    try {
        await db.update(templates)
            .set({
                tags: ["Valentine", "Love", "Interactive"],
                salePrice: 149,
            })
            .where(eq(templates.files, "valentine"));

        const updated = await db.select().from(templates).where(eq(templates.files, "valentine"));
        return NextResponse.json({ status: "success", updated });
    } catch (err: any) {
        return NextResponse.json({ status: "error", error: err.message });
    }
}
