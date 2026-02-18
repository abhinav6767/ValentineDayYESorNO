import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { templates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { createPage } from "@/app/create/actions";
import CreatePageForm from "@/components/create/create-page-form";

export default async function CreatePage({ params }: { params: Promise<{ templateId: string }> }) {
    const session = await auth();
    const { templateId: templateIdStr } = await params;

    const templateId = parseInt(templateIdStr);
    if (isNaN(templateId)) notFound();

    const [template] = await db.select().from(templates).where(eq(templates.id, templateId));

    if (!template) notFound();

    return (
        <div className="container py-10 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Customize {template.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Fill in the details to generate your page.
                    </p>
                </CardHeader>
                <CardContent>
                    <CreatePageForm templateId={template.id} />
                </CardContent>
            </Card>
        </div>
    );
}
