import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function seedCityTemplate() {
    const { db } = await import("@/db");
    const { templates } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    console.log("📝 Seeding City template...\n");

    // Check if already exists
    const existing = await db.select().from(templates).where(eq(templates.files, "city"));
    if (existing.length > 0) {
        console.log("  ⏭️  Skipped (already exists): City");
        process.exit(0);
    }

    try {
        await db.insert(templates).values({
            name: "City",
            description: "A royal Indian night wedding invitation. Floating sky lanterns, ornate botanical event cards, vintage car art, couple photo gallery, live countdown & WhatsApp RSVP.",
            price: 499,
            salePrice: 349,
            thumbnail: "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?q=80&w=3540&auto=format&fit=crop",
            tags: ["Wedding", "Indian", "Royal", "Invitation"],
            files: "city",
            isPublic: true,
        });
        console.log("  ✅ Created: City");
    } catch (err: any) {
        console.error("  ❌ Error creating City:", err.message);
    }

    console.log("\n🎉 Done seeding City template!");
    process.exit(0);
}

seedCityTemplate().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
