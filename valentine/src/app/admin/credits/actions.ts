"use server";

import { db } from "@/db";
import { users, creditTransactions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        throw new Error("Unauthorized");
    }
    return session;
}

export async function adjustCredits(userId: string, amount: number, reason: string) {
    await requireAdmin();

    if (!userId || typeof amount !== "number" || amount === 0) {
        throw new Error("Invalid parameters");
    }

    if (!reason || reason.trim().length === 0) {
        throw new Error("Reason is required");
    }

    // Update user credits
    await db
        .update(users)
        .set({ credits: sql`GREATEST(${users.credits} + ${amount}, 0)` })
        .where(eq(users.id, userId));

    // Log transaction
    await db.insert(creditTransactions).values({
        userId,
        amount,
        type: amount > 0 ? "purchase" : "spend",
        description: `Admin adjustment: ${reason.trim()}`,
    });

    revalidatePath("/admin/credits");
    return { success: true };
}
