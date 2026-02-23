"use server";

import { db } from "@/db";
import { templates } from "@/db/schema";
import { getPresignedUploadUrl } from "@/lib/storage";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const templateSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.coerce.number().min(0),
    salePrice: z.coerce.number().optional(),
    tags: z.string().optional(), // Comma separated
    files: z.string().min(1), // Component path
    isPublic: z.coerce.boolean(),
    thumbnail: z.string().optional(), // URL
});

export async function createTemplate(prevState: any, formData: FormData) {
    const rawData = {
        name: formData.get("name"),
        description: formData.get("description"),
        price: formData.get("price"),
        salePrice: formData.get("salePrice") || undefined,
        tags: formData.get("tags"),
        files: formData.get("files"),
        isPublic: formData.get("isPublic") === "on",
        thumbnail: formData.get("thumbnail"),
    };

    const validated = templateSchema.safeParse(rawData);

    if (!validated.success) {
        return {
            errors: validated.error.flatten().fieldErrors,
            message: "Validation failed",
        };
    }

    const { tags, ...rest } = validated.data;
    const tagArray = tags ? tags.split(",").map((t) => t.trim()) : [];

    try {
        await db.insert(templates).values({
            ...rest,
            tags: tagArray,
        });
    } catch (e) {
        return { message: "Database error" };
    }

    revalidatePath("/admin/templates");
    redirect("/admin/templates");
}

export async function getUploadUrl(filename: string, contentType: string) {
    const key = `templates/${Date.now()}-${filename}`;
    const url = await getPresignedUploadUrl(key, contentType);
    return { url, key };
}

export async function deleteTemplate(id: number) {
    try {
        await db.delete(templates).where(eq(templates.id, id));
        revalidatePath("/admin/templates");
    } catch (e) {
        return { message: "Database error" };
    }
}

export async function updateTemplate(id: number, prevState: any, formData: FormData) {
    const rawData = {
        name: formData.get("name"),
        description: formData.get("description"),
        price: formData.get("price"),
        salePrice: formData.get("salePrice") || undefined,
        tags: formData.get("tags"),
        files: formData.get("files"),
        isPublic: formData.get("isPublic") === "on",
        thumbnail: formData.get("thumbnail"), // If empty, means no change or handled by client? 
        // If thumbnail is empty string, we might want to keep existing.
        // Client should only send thumbnail if it's new. 
        // But if it's empty, and we want to keep existing, we need to know.
        // Usually invalid if not provided on Create, but optional on Update.
    };

    // Allow files and thumbnail to be optional on update if we want to keep existing?
    // For now, let's assume validation requires files. 
    // We can modify schema for update.

    // Use same schema but maybe relax files/thumbnail?
    // Schema says files is string min 1. 

    const validated = templateSchema.safeParse(rawData);

    // If thumbnail is missing from formData, it might be null or empty string.
    // We should handle that.

    if (!validated.success) {
        // If files is missing but we are updating... actually form sends it.
        return {
            errors: validated.error.flatten().fieldErrors,
            message: "Validation failed",
        };
    }

    const { tags, ...rest } = validated.data;
    const tagArray = tags ? tags.split(",").map((t) => t.trim()) : [];

    // If thumbnail is empty/undefined, remove it from update object so we don't overwrite with null if DB has value
    const updateData: any = { ...rest, tags: tagArray };
    if (!updateData.thumbnail) delete updateData.thumbnail;

    try {
        await db.update(templates).set(updateData).where(eq(templates.id, id));
    } catch (e) {
        return { message: "Database error" };
    }

    revalidatePath("/admin/templates");
    redirect("/admin/templates");
}
