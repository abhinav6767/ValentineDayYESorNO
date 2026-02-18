import TemplateForm from "@/components/admin/template-form";

export default function NewTemplatePage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Create Template</h3>
                <p className="text-sm text-muted-foreground">
                    Fill in the details for the new template.
                </p>
            </div>
            <div className="max-w-2xl">
                <TemplateForm />
            </div>
        </div>
    );
}
