import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../src/db";
import { users, reviews } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function seed() {
    console.log("🔧 Setting admin role...");

    // Set admin role
    const result = await db
        .update(users)
        .set({ role: "ADMIN" })
        .where(eq(users.email, "abhinavsaxena6767@gmail.com"))
        .returning({ id: users.id, email: users.email, role: users.role });

    if (result.length > 0) {
        console.log(`✅ Admin role set for: ${result[0].email} (ID: ${result[0].id})`);

        // Insert 8 sample reviews using this user's ID as the author
        // In production these would come from different real users
        const sampleReviews = [
            {
                userId: result[0].id,
                text: "Made the most beautiful Valentine's page for my girlfriend in just 5 minutes! She absolutely loved it. The animations and music made it so special. Will definitely use OmniTemplates for her birthday too! 💕",
                rating: 5,
                role: "Software Engineer",
                status: "approved" as const,
                creditsAwarded: 15,
            },
            {
                userId: result[0].id,
                text: "I was looking for something unique to surprise my wife on our anniversary. This platform exceeded all my expectations! The templates are gorgeous and customization was so easy.",
                rating: 5,
                role: "Marketing Manager",
                status: "approved" as const,
                creditsAwarded: 15,
            },
            {
                userId: result[0].id,
                text: "As a non-technical person, I was worried I wouldn't be able to create a nice website. But OmniTemplates made it incredibly simple. The drag-and-drop experience is fantastic!",
                rating: 4,
                role: "Teacher",
                status: "approved" as const,
                creditsAwarded: 15,
            },
            {
                userId: result[0].id,
                text: "Used the birthday template for my best friend's surprise party invite. Everyone asked me how I made such a professional-looking page! The confetti animation was the cherry on top 🎂",
                rating: 5,
                role: "Graphic Designer",
                status: "approved" as const,
                creditsAwarded: 15,
            },
            {
                userId: result[0].id,
                text: "The proposal template helped me create the most memorable moment of our lives! My fiancée said yes and she keeps showing the page to everyone. Thank you OmniTemplates! 💍",
                rating: 5,
                role: "Business Analyst",
                status: "approved" as const,
                creditsAwarded: 15,
            },
            {
                userId: result[0].id,
                text: "Great concept and beautiful templates. I wish there were more free options, but the premium ones are definitely worth the price. The credit system is a nice touch.",
                rating: 4,
                role: "Student",
                status: "approved" as const,
                creditsAwarded: 15,
            },
            {
                userId: result[0].id,
                text: "I've tried several website builders for personal pages and OmniTemplates is by far the best for occasions like birthdays and anniversaries. The music integration feature is everything! 🎵",
                rating: 5,
                role: "Content Creator",
                status: "approved" as const,
                creditsAwarded: 15,
            },
            {
                userId: result[0].id,
                text: "Shared my Valentine's page on Instagram and got so many DMs asking how I made it! Simple, beautiful, and affordable. The customer support team was also super helpful when I had a question.",
                rating: 5,
                role: "Freelancer",
                status: "approved" as const,
                creditsAwarded: 15,
            },
        ];

        console.log("📝 Inserting 8 sample reviews...");
        await db.insert(reviews).values(sampleReviews);
        console.log("✅ 8 sample reviews inserted!");
    } else {
        console.log("⚠️  User with email abhinavsaxena6767@gmail.com not found!");
    }

    process.exit(0);
}

seed().catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
});
