import "dotenv/config";
import { db } from "../src/db";
import { templates } from "../src/db/schema";

async function seedTemplates() {
    console.log("📝 Seeding new templates...\n");

    const newTemplates = [
        {
            name: "Happy Anniversary",
            description: "Celebrate your love story with an elegant navy & gold interactive page. Floating sparkles, celebration bursts, and a romantic message reveal.",
            price: 299,
            salePrice: 199,
            thumbnail: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=3540&auto=format&fit=crop",
            tags: ["Anniversary", "Love", "Elegant"],
            files: "anniversary",
            isPublic: true,
        },
        {
            name: "Will You Marry Me?",
            description: "The most magical proposal page. Deep purple vibes, floating roses & diamonds, an escaping 'No' button, and a breathtaking ring reveal.",
            price: 499,
            salePrice: 349,
            thumbnail: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=3540&auto=format&fit=crop",
            tags: ["Proposal", "Romance", "Interactive"],
            files: "proposal",
            isPublic: true,
        },
        {
            name: "Happy Birthday",
            description: "An explosive birthday celebration! Blow out animated candles, watch balloons float, and enjoy a confetti party burst. Perfect for any age.",
            price: 299,
            salePrice: 149,
            thumbnail: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=3540&auto=format&fit=crop",
            tags: ["Birthday", "Party", "Fun"],
            files: "birthday",
            isPublic: true,
        },
    ];

    for (const tmpl of newTemplates) {
        try {
            await db.insert(templates).values(tmpl);
            console.log(`  ✅ Created: ${tmpl.name}`);
        } catch (err: any) {
            if (err.message?.includes("duplicate") || err.message?.includes("unique") || err.code === "23505") {
                console.log(`  ⏭️  Skipped (already exists): ${tmpl.name}`);
            } else {
                console.error(`  ❌ Error creating ${tmpl.name}:`, err.message);
            }
        }
    }

    console.log("\n🎉 Done seeding templates!");
    process.exit(0);
}

seedTemplates().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
