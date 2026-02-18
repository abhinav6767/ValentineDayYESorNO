"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createTemplate, updateTemplate, getUploadUrl } from "@/app/admin/actions";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Define schema same as server action for client validation
const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    description: z.string().optional(),
    price: z.coerce.number().min(0),
    salePrice: z.coerce.number().optional(),
    tags: z.string().optional(),
    files: z.string().min(1, { message: "Component path is required" }),
    isPublic: z.boolean().default(true),
});

interface TemplateFormProps {
    initialData?: {
        id: number;
        name: string;
        description: string | null;
        price: number | null;
        salePrice: number | null;
        tags: string[] | null;
        files: string;
        isPublic: boolean | null;
        thumbnail: string | null;
    };
}

export default function TemplateForm({ initialData }: TemplateFormProps) {
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            price: initialData?.price || 0,
            salePrice: initialData?.salePrice || undefined,
            tags: initialData?.tags?.join(", ") || "",
            files: initialData?.files || "",
            isPublic: initialData?.isPublic !== false, // Default to true if null or true
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        let thumbnailKey = "";

        if (thumbnailFile) {
            setIsUploading(true);
            try {
                const { url, key } = await getUploadUrl(thumbnailFile.name, thumbnailFile.type);
                await fetch(url, {
                    method: "PUT",
                    body: thumbnailFile,
                    headers: {
                        "Content-Type": thumbnailFile.type,
                    },
                });
                thumbnailKey = key;
            } catch (error) {
                console.error("Upload failed", error);
                alert("Upload failed");
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
        }

        const formData = new FormData();
        formData.append("name", values.name);
        if (values.description) formData.append("description", values.description);
        formData.append("price", values.price.toString());
        if (values.salePrice) formData.append("salePrice", values.salePrice.toString());
        if (values.tags) formData.append("tags", values.tags || "");
        formData.append("files", values.files);
        formData.append("isPublic", values.isPublic ? "on" : "off");
        if (thumbnailKey) formData.append("thumbnail", thumbnailKey);

        if (initialData) {
            await updateTemplate(initialData.id, null, formData);
        } else {
            await createTemplate(null, formData);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Template Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Valentine Special" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Descriptive text..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price (in cents)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="salePrice"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sale Price (optional)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tags (comma separated)</FormLabel>
                            <FormControl>
                                <Input placeholder="tag1, tag2, tag3" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="files"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Component Path (e.g. templates/Valentine)</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Public</FormLabel>
                                <FormDescription>
                                    Make this template visible to everyone.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormItem>
                    <FormLabel>Thumbnail</FormLabel>
                    {initialData?.thumbnail && (
                        <div className="mb-2 text-sm text-muted-foreground">
                            Current: {initialData.thumbnail}
                        </div>
                    )}
                    <FormControl>
                        <Input type="file" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} />
                    </FormControl>
                </FormItem>

                <Button type="submit" disabled={isUploading}>{isUploading ? "Uploading..." : (initialData ? "Update Template" : "Create Template")}</Button>
            </form>
        </Form>
    );
}
