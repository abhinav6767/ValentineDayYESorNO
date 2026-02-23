import TemplateForm from "@/components/admin/template-form";
import { db } from "@/db";
import { templates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function EditTemplatePage({
    params,
}: {
    params: { id: string };
}) {
    const templateId = parseInt(params.id);
    if (isNaN(templateId)) notFound();

    const [template] = await db
        .select()
        .from(templates)
        .where(eq(templates.id, templateId));

    if (!template) notFound();

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Edit Template</h3>
                <p className="text-sm text-muted-foreground">
                    Update the template details.
                </p>
            </div>
            <div className="max-w-2xl">
                <TemplateForm initialData={template} />
            </div>
        </div>
    );
}
