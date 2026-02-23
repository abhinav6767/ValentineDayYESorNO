import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { db } from "@/db";
import { templates } from "@/db/schema";
import Link from "next/link";
import { DeleteTemplateButton } from "@/components/admin/delete-template-button";

export default async function AdminTemplatesPage() {
    const allTemplates = await db.select().from(templates);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Templates</h2>
                <Button asChild>
                    <Link href="/admin/templates/new">Add Template</Link>
                </Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Credits</TableHead>
                            <TableHead>Sale Credits</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allTemplates.map((template) => (
                            <TableRow key={template.id}>
                                <TableCell className="font-medium">{template.name}</TableCell>
                                <TableCell>{template.price} 🪙</TableCell>
                                <TableCell>
                                    {template.salePrice
                                        ? `${template.salePrice} 🪙`
                                        : "-"}
                                </TableCell>
                                <TableCell>
                                    {template.isPublic ? "Public" : "Draft"}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/admin/templates/${template.id}/edit`}>
                                            Edit
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {allTemplates.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No templates found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
