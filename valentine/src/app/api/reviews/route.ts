import { db } from "@/db";
import { reviews, users, creditTransactions } from "@/db/schema";
import { auth } from "@/auth";
import { eq, desc, and, gte, sql, isNull, isNotNull } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";

// ─── Simple in-memory rate limiter ──────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string, maxRequests = 30, windowMs = 60000): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
        return false;
    }

    entry.count++;
    if (entry.count > maxRequests) {
        return true;
    }

    return false;
}

function getClientIp(req: NextRequest): string {
    return (
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown"
    );
}

// ─── GET: Fetch approved reviews ────────────────────
export async function GET(req: NextRequest) {
    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
        return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429 }
        );
    }

    try {
        const approvedReviews = await db
            .select({
                id: reviews.id,
                userId: reviews.userId,
                text: reviews.text,
                rating: reviews.rating,
                role: reviews.role,
                videoUrl: reviews.videoUrl,
                status: reviews.status,
                createdAt: reviews.createdAt,
                userName: users.name,
                userImage: users.image,
            })
            .from(reviews)
            .leftJoin(users, eq(reviews.userId, users.id))
            .where(eq(reviews.status, "approved"))
            .orderBy(desc(reviews.createdAt));

        const formatted = approvedReviews.map((r) => ({
            id: r.id,
            userId: r.userId,
            text: r.text,
            rating: r.rating,
            role: r.role,
            videoUrl: r.videoUrl,
            status: r.status,
            createdAt: r.createdAt,
            user: {
                name: r.userName,
                image: r.userImage,
            },
        }));

        return NextResponse.json({ reviews: formatted });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json(
            { error: "Failed to fetch reviews" },
            { status: 500 }
        );
    }
}

// ─── POST: Submit a new review ──────────────────────
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Please sign in to submit a review" }, { status: 401 });
    }

    const ip = getClientIp(req);
    if (isRateLimited(ip, 5, 60000)) {
        return NextResponse.json(
            { error: "Too many requests. Please try again later." },
            { status: 429 }
        );
    }

    let body: any;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { rating, text, role, videoUrl } = body;

    // ── Validation ──────────────────────────────────
    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
        return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    if (!text || typeof text !== "string" || text.trim().length === 0) {
        return NextResponse.json({ error: "Review text is required" }, { status: 400 });
    }

    if (text.trim().length > 500) {
        return NextResponse.json({ error: "Review text must be 500 characters or less" }, { status: 400 });
    }

    if (role && (typeof role !== "string" || role.length > 50)) {
        return NextResponse.json({ error: "Role must be 50 characters or less" }, { status: 400 });
    }

    if (videoUrl && typeof videoUrl === "string" && videoUrl.trim().length > 0) {
        try {
            new URL(videoUrl);
        } catch {
            return NextResponse.json({ error: "Invalid video URL" }, { status: 400 });
        }
    }

    // ── Monthly limit check: 1 text + 1 video per month ──
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const hasVideo = videoUrl && typeof videoUrl === "string" && videoUrl.trim().length > 0;

    try {
        const existingReviews = await db
            .select({ id: reviews.id, videoUrl: reviews.videoUrl })
            .from(reviews)
            .where(
                and(
                    eq(reviews.userId, session.user.id),
                    gte(reviews.createdAt, startOfMonth)
                )
            );

        const existingTextReview = existingReviews.find((r) => !r.videoUrl);
        const existingVideoReview = existingReviews.find((r) => !!r.videoUrl);

        if (hasVideo && existingVideoReview) {
            return NextResponse.json(
                { error: "You can only submit one video review per month" },
                { status: 400 }
            );
        }

        if (!hasVideo && existingTextReview) {
            return NextResponse.json(
                { error: "You can only submit one text review per month" },
                { status: 400 }
            );
        }

        // ── Determine status and credits ──────────────
        // Text-only: auto-approve → 15 credits
        // Video: pending → 40 credits after admin approval
        const reviewStatus = hasVideo ? "pending" : "approved";
        const creditsToAward = hasVideo ? 0 : 15; // video credits awarded on admin approval

        // Insert review
        const [newReview] = await db
            .insert(reviews)
            .values({
                userId: session.user.id,
                text: text.trim(),
                rating: Math.round(rating),
                role: role?.trim() || null,
                videoUrl: hasVideo ? videoUrl.trim() : null,
                status: reviewStatus as "pending" | "approved" | "rejected",
                creditsAwarded: creditsToAward,
            })
            .returning();

        // Award credits for text reviews immediately
        if (creditsToAward > 0) {
            await db
                .update(users)
                .set({ credits: sql`${users.credits} + ${creditsToAward}` })
                .where(eq(users.id, session.user.id));

            await db.insert(creditTransactions).values({
                userId: session.user.id,
                amount: creditsToAward,
                type: "review_reward",
                description: "Text review reward",
                referenceId: String(newReview.id),
            });
        }

        return NextResponse.json({
            success: true,
            review: newReview,
            creditsAwarded: creditsToAward,
            message: hasVideo
                ? "Video review submitted! Credits will be awarded after admin approval."
                : `Review submitted! You earned ${creditsToAward} credits!`,
        });
    } catch (error) {
        console.error("Error submitting review:", error);
        return NextResponse.json(
            { error: "Failed to submit review" },
            { status: 500 }
        );
    }
}
