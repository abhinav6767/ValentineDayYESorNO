import { db } from "@/db";
import { pages, templates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import RazorpayButton from "@/components/checkout/razorpay-button";

export default async function CheckoutPage({ params }: { params: Promise<{ pageId: string }> }) {
    const { pageId } = await params;

    const [page] = await db.select().from(pages).where(eq(pages.id, pageId));
    if (!page) notFound();

    if (page.isPaid) {
        redirect(`/p/${page.slug}`);
    }

    if (!page.templateId) {
        return <div>Invalid Page Data</div>; // Should not happen given constraints, but for type safety
    }

    const [template] = await db.select().from(templates).where(eq(templates.id, page.templateId));
    if (!template) notFound();

    const price = template.salePrice || template.price;

    return (
        <div className="container flex items-center justify-center min-h-screen py-10">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Checkout</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-4">
                        <span className="font-medium">{template.name} Template</span>
                        <span className="font-bold">{price} 🪙 credits</span>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        <p>Unlock your personalized page forever.</p>
                        <p>Removes watermarks and enables public sharing.</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <RazorpayButton pageId={page.id} amount={price} />
                </CardFooter>
            </Card>
        </div>
    );
}
