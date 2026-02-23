
import { auth } from "@/auth";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { eq, isNull, count } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    const userId = session?.user?.id;

    // Count total pages
    const [total] = await db.select({ count: count() }).from(pages);

    // Count anonymous pages
    const [anonymous] = await db.select({ count: count() }).from(pages).where(isNull(pages.userId));

    // Get user pages if logged in
    let userPages: (typeof pages.$inferSelect)[] = [];
    if (userId) {
        userPages = await db.select().from(pages).where(eq(pages.userId, userId));
    }

    return NextResponse.json({
        currentUser: {
            id: userId,
            name: session?.user?.name,
            email: session?.user?.email
        },
        stats: {
            totalPages: total.count,
            anonymousPages: anonymous.count,
            userPagesCount: userPages.length
        },
        userPages: userPages.map(p => ({
            id: p.id,
            slug: p.slug,
            templateId: p.templateId,
            createdAt: p.createdAt
        }))
    });
}
