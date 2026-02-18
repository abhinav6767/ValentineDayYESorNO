"use server";

import { db } from "@/db";
import { reviews, users, creditTransactions } from "@/db/schema";
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

export async function approveReview(reviewId: number) {
    await requireAdmin();

    const [review] = await db
        .select()
        .from(reviews)
        .where(eq(reviews.id, reviewId));

    if (!review) throw new Error("Review not found");
    if (review.status === "approved") throw new Error("Already approved");

    // Determine credits: video reviews get 40, text reviews get 15
    const creditsToAward = review.videoUrl ? 40 : 15;

    // Update review status
    await db
        .update(reviews)
        .set({ status: "approved", creditsAwarded: creditsToAward })
        .where(eq(reviews.id, reviewId));

    // Award credits to user
    await db
        .update(users)
        .set({ credits: sql`${users.credits} + ${creditsToAward}` })
        .where(eq(users.id, review.userId));

    // Log transaction
    await db.insert(creditTransactions).values({
        userId: review.userId,
        amount: creditsToAward,
        type: "review_reward",
        description: `${review.videoUrl ? "Video" : "Text"} review approved — ${creditsToAward} credits`,
        referenceId: String(reviewId),
    });

    revalidatePath("/admin/reviews");
    return { success: true, creditsAwarded: creditsToAward };
}

export async function rejectReview(reviewId: number) {
    await requireAdmin();

    const [review] = await db
        .select()
        .from(reviews)
        .where(eq(reviews.id, reviewId));

    if (!review) throw new Error("Review not found");

    await db
        .update(reviews)
        .set({ status: "rejected", creditsAwarded: 0 })
        .where(eq(reviews.id, reviewId));

    revalidatePath("/admin/reviews");
    return { success: true };
}
