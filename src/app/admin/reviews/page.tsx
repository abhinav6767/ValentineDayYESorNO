import { db } from "@/db";
import { reviews, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import ReviewsTable from "./reviews-table";

export default async function AdminReviewsPage() {
    const allReviews = await db
        .select({
            id: reviews.id,
            userId: reviews.userId,
            text: reviews.text,
            rating: reviews.rating,
            role: reviews.role,
            videoUrl: reviews.videoUrl,
            status: reviews.status,
            creditsAwarded: reviews.creditsAwarded,
            createdAt: reviews.createdAt,
            userName: users.name,
            userEmail: users.email,
            userImage: users.image,
        })
        .from(reviews)
        .leftJoin(users, eq(reviews.userId, users.id))
        .orderBy(desc(reviews.createdAt));

    const formattedReviews = allReviews.map((r) => ({
        id: r.id,
        userId: r.userId,
        text: r.text,
        rating: r.rating,
        role: r.role,
        videoUrl: r.videoUrl,
        status: r.status as string,
        creditsAwarded: r.creditsAwarded,
        createdAt: r.createdAt?.toISOString() || "",
        user: {
            name: r.userName,
            email: r.userEmail,
            image: r.userImage,
        },
    }));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Reviews Management</h1>
                <p className="text-muted-foreground mt-1">
                    Moderate reviews and award credits. Video reviews require your approval.
                </p>
            </div>

            <ReviewsTable reviews={formattedReviews} />
        </div>
    );
}
