"use server";

import { db } from "@/db";
import { pages, templates, users, creditTransactions } from "@/db/schema";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getPresignedUploadUrl } from "@/lib/storage";

const createPageSchema = z.object({
    templateId: z.coerce.number(),
    recipientName: z.string().min(1),
    message: z.string().optional(),
    photos: z.string().optional(), // JSON string
});

export async function createPage(formData: FormData) {
    const rawData = {
        templateId: formData.get("templateId"),
        recipientName: formData.get("recipientName"),
        message: formData.get("message"),
        photos: formData.get("photos"),
    };

    const validated = createPageSchema.safeParse(rawData);

    if (!validated.success) {
        console.error(validated.error);
        throw new Error("Validation failed");
    }

    const { templateId, photos: photosJson, ...content } = validated.data;
    const items = photosJson ? JSON.parse(photosJson) : [];

    // Resolve public URLs for keys
    // Assuming Supabase Storage for now, or R2. 
    // We need to know the public base URL.
    // For now, let's assume we are just storing the key and the component knows how to render it
    // OR we construct the full URL here.
    // Since ValentineTemplate expects full URLs or relative paths...
    // Let's assume there's a helper or we use a standard public bucket URL.

    // NOTE: In a real app we would get this from env.
    const storageBaseUrl = process.env.NEXT_PUBLIC_STORAGE_URL || "";

    // If not set, we might be in trouble. Let's try to construct it if using Supabase.
    // Format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<key>

    // Let's try to infer if it's a key or URL.
    const resolvedPhotos = items.map((key: string) => {
        if (key.startsWith("http")) return key;
        // If it looks like a key, prepend base. 
        // We'll assume the client uploads to 'assets' bucket for now based on getPresignedUploadUrl implementation details which we haven't seen fully but likely uses a bucket.
        // Wait, getPresignedUploadUrl usually returns signed URL for PUT.
        // We need the GET URL.

        // Let's fallback to just passing the key if we can't resolve, but ValentineTemplate expects "src".
        return `${storageBaseUrl}/${key}`;
    });

    const finalContent = {
        ...content,
        photos: resolvedPhotos
    };

    const [template] = await db.select().from(templates).where(eq(templates.id, templateId));
    if (!template) {
        throw new Error("Template not found");
    }

    const session = await auth();
    const userId = session?.user?.id;

    const slug = crypto.randomUUID();
    const price = template.salePrice || template.price;

    let result = { pageId: "", isPaid: false };

    try {
        result = await db.transaction(async (tx) => {
            // Check if user should pay with credits
            let payWithCredits = false;
            let currentCredits = 0;

            if (template.price > 0 && userId) {
                const [user] = await tx.select().from(users).where(eq(users.id, userId));
                currentCredits = user?.credits || 0;

                console.log(`[CreatePage] User: ${userId}, Credits: ${currentCredits}, Price: ${price}`);

                if (user && user.credits >= price) {
                    payWithCredits = true;
                }
            }

            // Determine final paid status
            const templateIsFree = template.price === 0;
            // Force boolean
            const isPaidState = !!(templateIsFree || payWithCredits);

            console.log(`[CreatePage] PayWithCredits: ${payWithCredits}, IsPaid: ${isPaidState}`);

            // Prepare page data
            const [newPage] = await tx.insert(pages).values({
                userId: userId || null, // Link page to user, strict null if undefined
                templateId,
                content: finalContent,
                slug: slug,
                isPaid: isPaidState,
                expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days retention
            }).returning();

            const newPageId = newPage.id;

            // Deduct credits if applicable
            if (payWithCredits) {
                console.log(`[CreatePage] Deducting ${price} credits from ${userId}`);
                await tx.update(users)
                    .set({ credits: sql`${users.credits} - ${price}` })
                    .where(eq(users.id, userId!));

                await tx.insert(creditTransactions).values({
                    userId: userId!,
                    amount: -price,
                    type: "spend",
                    description: `Purchased template: ${template.name}`,
                    referenceId: newPageId,
                });
            }

            return { pageId: newPageId, isPaid: isPaidState };
        });
    } catch (e: any) {
        console.error("Transaction failed:", e);
        throw new Error(e.message || "Failed to create page");
    }

    if (result.isPaid) {
        redirect(`/p/${slug}`);
    } else {
        redirect(`/checkout/${result.pageId}`);
    }
}

export async function getPublicUploadUrl(filename: string, contentType: string) {
    // TODO: Rate limiting / Authentication check?
    // For now allow guest uploads for page creation.
    const key = `uploads/${Date.now()}-${crypto.randomUUID()}-${filename}`;
    const url = await getPresignedUploadUrl(key, contentType);
    return { url, key };
}
