"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useTransition } from "react";
import { createPage } from "@/app/create/actions";
import { Loader2, X } from "lucide-react";

interface CreatePageFormProps {
    templateId: number;
}

export default function CreatePageForm({ templateId }: CreatePageFormProps) {
    const [isPending, startTransition] = useTransition();
    const [uploading, setUploading] = useState(false);

    // Custom file handling
    const [photos, setPhotos] = useState<string[]>([]); // Array of s3Keys
    const [currentUploadProgress, setCurrentUploadProgress] = useState(0);

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setCurrentUploadProgress(0);

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    const err = await response.json().catch(() => ({}));
                    console.error("Upload failed:", err);
                    throw new Error(err.error || "Upload failed");
                }

                const { key } = await response.json();
                setPhotos(prev => [...prev, key]);
                setCurrentUploadProgress(((i + 1) / files.length) * 100);
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Error uploading files: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            setUploading(false);
            setCurrentUploadProgress(0);
            e.target.value = "";
        }
    }

    const removePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    async function onSubmit(formData: FormData) {
        if (uploading) {
            alert("Please wait for files to upload");
            return;
        }

        formData.append("photos", JSON.stringify(photos));

        startTransition(async () => {
            try {
                await createPage(formData);
            } catch (error) {
                alert("Failed to create page");
            }
        });
    }

    return (
        <form action={onSubmit} className="space-y-6">
            <input type="hidden" name="templateId" value={templateId} />

            <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Name</Label>
                <Input id="recipient" name="recipientName" placeholder="John Doe" required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea id="message" name="message" placeholder="Write your heartfelt message here..." rows={4} />
            </div>

            {/* Dynamic File Upload Fields */}
            <div className="space-y-2">
                <Label>Gallery Photos (Select multiple)</Label>
                <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    disabled={uploading}
                />

                {uploading && (
                    <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Uploading...</div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                            <div className="bg-primary h-full transition-all duration-300" style={{ width: `${currentUploadProgress}%` }} />
                        </div>
                    </div>
                )}

                {photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-4">
                        {photos.map((key, i) => (
                            <div key={key} className="relative group aspect-square bg-slate-100 rounded-md overflow-hidden border">
                                <div className="flex items-center justify-center h-full text-xs text-center p-1 break-all text-gray-500">
                                    Image {i + 1}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removePhoto(i)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-100 hover:bg-red-600"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <p className="text-xs text-muted-foreground">
                    Uploaded {photos.length} photos. These will be shown in the floating gallery.
                </p>
            </div>

            <div className="pt-4">
                <Button type="submit" className="w-full" disabled={isPending || uploading}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Generate Page
                </Button>
            </div>
        </form>
    );
}
