import { db } from "@/db";
import { pages, templates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { templateRegistry } from "@/templates/registry";
import { Metadata, ResolvingMetadata } from "next";

// This page renders the final user content.
// Ideally, this fetches the "Template Component" dynamically.
// Since we can't dynamic import from a path string easily in Server Components without registry,
// we might need a mapping or a registry.
// For Phase 1, we will assume a "Default Valentine Template" if the path matches, 
// or maybe we just check the template name/file and map it.

// Let's create a registry in @/templates/registry.tsx

type Props = {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { slug } = await params;

    const [page] = await db.select().from(pages).where(eq(pages.slug, slug));

    if (!page) {
        return {
            title: "Page Not Found - OmniTemplates",
        }
    }

    const content = page.content as any;
    const title = content.title || "A Special Message for You";
    const recipient = content.recipient || "Someone Special";

    return {
        title: `${title} - For ${recipient}`,
        description: `A personalized page created for ${recipient}.`,
        openGraph: {
            title: `${title} - For ${recipient}`,
            description: `A personalized greeting page made just for you.`,
            // images: ['/some-thumbnail.jpg'], // TODO: Add dynamic thumbnail generation later
        },
    }
}

export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const [page] = await db.select().from(pages).where(eq(pages.slug, slug));

    if (!page) notFound();

    // Check if paid?
    if (!page.isPaid) {
        // Show watermark or redirect to pay?
        // Use case: Preview? 
        // User says "Secure and hard-to-guess links".
        // If payment is required, we shouldn't show the full page without watermark?
        // For MVP, just show a banner.
    }

    if (!page.templateId) notFound();

    const [template] = await db.select().from(templates).where(eq(templates.id, page.templateId));
    if (!template) notFound();

    // Parse content
    const content = page.content as any;

    // Get Component
    const TemplateComponent = templateRegistry[template.files];

    if (!TemplateComponent) {
        return <div>Template not found: {template.files}</div>;
    }

    return (
        <>
            <TemplateComponent content={{
                recipientName: content.recipient,
                message: content.message,
                photos: content.image1 ? [content.image1] : [],
                // Map other fields
            }} />

            {!page.isPaid && (
                <div className="fixed bottom-0 left-0 right-0 z-[99999] bg-black/80 text-white p-4 text-center">
                    This page is created with OmniTemplates. <a href={`/checkout/${page.id}`} className="underline font-bold">Pay to remove this banner</a>
                </div>
            )}

            <div className="fixed bottom-4 right-4 z-[99999] text-xs text-white/50 opacity-50 pointer-events-none">
                Powered by OmniTemplates
            </div>
        </>
    );
}
