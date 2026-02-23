
import { auth } from "@/auth";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { isNull, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    // Update all pages with NULL userId to the current user
    const result = await db
        .update(pages)
        .set({ userId: userId })
        .where(isNull(pages.userId))
        .returning();

    return NextResponse.json({
        success: true,
        updatedCount: result.length,
        updatedPages: result.map(p => p.id)
    });
}
