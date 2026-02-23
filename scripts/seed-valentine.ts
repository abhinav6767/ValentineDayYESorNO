
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
    // Dynamic import
    const { db } = await import("@/db");
    const { templates, pages } = await import("@/db/schema");

    console.log("Seeding Valentine Template...");

    // 1. Create or Update Template
    let [template] = await db.select().from(templates).where(eq(templates.files, "valentine"));

    if (!template) {
        const [newTemplate] = await db.insert(templates).values({
            name: "Classic Valentine",
            description: "The classic animated Valentine's proposal with floating hearts and music.",
            price: 999, // $9.99
            files: "valentine", // This matches the registry key
            isPublic: true,
            thumbnail: "valentine-thumb", // Placeholder
        }).returning();
        template = newTemplate;
        console.log("Created Template:", template.id);
    } else {
        console.log("Template already exists:", template.id);
    }

    // 2. Create a Test Page
    const slug = "test-valentine";
    const [page] = await db.select().from(pages).where(eq(pages.slug, slug));

    if (!page) {
        await db.insert(pages).values({
            templateId: template.id,
            slug: slug,
            content: {
                recipient: "My Love",
                message: "You mean the world to me.",
                image1: "/templates/valentine/photos/20250425_1107_Girl's Slimmer Face_remix_01jsnq4vzrefqvk4cayqbzzx1f.png" // Sample image from assets
            },
            isPaid: false, // Show banner
        });
        console.log(`Created Test Page: http://localhost:3000/p/${slug}`);
    } else {
        // Update template ID just in case
        await db.update(pages).set({ templateId: template.id }).where(eq(pages.slug, slug));
        console.log(`Test Page available: http://localhost:3000/p/${slug}`);
    }

    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
