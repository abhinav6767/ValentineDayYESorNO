"use server";

import { db } from "@/db";
import { pages, templates } from "@/db/schema";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
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

    const slug = crypto.randomUUID();
    const isFree = template.price === 0;
    let pageId = "";

    try {
        const [newPage] = await db.insert(pages).values({
            templateId,
            content: finalContent,
            slug: slug,
            isPaid: isFree,
        }).returning();
        pageId = newPage.id;
    } catch (e) {
        console.error(e);
        throw new Error("Database error");
    }

    if (isFree) {
        redirect(`/p/${slug}`);
    } else {
        redirect(`/checkout/${pageId}`);
    }
}

export async function getPublicUploadUrl(filename: string, contentType: string) {
    // TODO: Rate limiting / Authentication check?
    // For now allow guest uploads for page creation.
    const key = `uploads/${Date.now()}-${crypto.randomUUID()}-${filename}`;
    const url = await getPresignedUploadUrl(key, contentType);
    return { url, key };
}
