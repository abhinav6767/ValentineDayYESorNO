import { db } from "@/db";
import { templates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { templateRegistry } from "@/templates/registry";
import { Metadata } from "next";
import Link from "next/link";

// Sample demo content for each template type
const sampleContent: Record<string, any> = {
    valentine: {
        recipientName: "Someone Special",
        message: "Every moment with you feels like a beautiful dream. You make my world brighter just by being in it. Happy Valentine's Day! 💕",
        photos: [],
    },
    anniversary: {
        recipientName: "My Forever Love",
        years: "5",
        message: "Five years of laughter, love, and endless memories. Every day with you is a gift I never take for granted. Here's to forever.",
        photos: [],
    },
    proposal: {
        recipientName: "My Everything",
        message: "From the first day I met you, I knew my life would never be the same. You are my best friend, my soulmate, and my entire world.",
        photos: [],
    },
    birthday: {
        recipientName: "Birthday Star",
        age: "25",
        message: "Another year of being amazing! May this year bring you everything you've ever wished for and more. You deserve it all! 🎉",
        photos: [],
    },
};

type Props = {
    params: Promise<{ templateId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { templateId } = await params;
    const [template] = await db
        .select()
        .from(templates)
        .where(eq(templates.id, parseInt(templateId)));

    if (!template) {
        return { title: "Template Not Found" };
    }

    return {
        title: `Preview: ${template.name} - OmniTemplates`,
        description: `Preview the "${template.name}" template before creating your own.`,
    };
}

export default async function PreviewPage({ params }: Props) {
    const { templateId } = await params;
    const [template] = await db
        .select()
        .from(templates)
        .where(eq(templates.id, parseInt(templateId)));

    if (!template) notFound();

    const TemplateComponent = templateRegistry[template.files];

    if (!TemplateComponent) {
        return (
            <div className="flex h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
                <p className="text-neutral-500">Template component not found.</p>
            </div>
        );
    }

    // Use sample content for this template, or a generic fallback
    const content = sampleContent[template.files] || {
        recipientName: "Your Loved One",
        message: "This is a preview of the template. Create your own to personalize it!",
        photos: [],
    };

    return (
        <>
            <TemplateComponent content={content} />

            {/* Preview Banner */}
            <div className="fixed top-0 left-0 right-0 z-[99999] bg-gradient-to-r from-pink-500 to-violet-600 text-white py-3 px-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <span className="text-lg">👁️</span>
                    <div>
                        <p className="text-sm font-semibold">Preview Mode — {template.name}</p>
                        <p className="text-xs text-white/80">This is a sample. Create your own to customize it!</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={`/create/${template.id}`}
                        className="px-5 py-2 rounded-full bg-white text-pink-600 text-sm font-bold hover:bg-white/90 transition-colors shadow-md"
                    >
                        Create My Own →
                    </Link>
                    <Link
                        href="/"
                        className="px-4 py-2 rounded-full border border-white/40 text-white text-sm font-medium hover:bg-white/10 transition-colors"
                    >
                        Back
                    </Link>
                </div>
            </div>
        </>
    );
}
