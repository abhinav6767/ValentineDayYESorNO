"use client";

import { Button } from "@/components/ui/button";
import { deleteTemplate } from "@/app/admin/actions";
import { useTransition } from "react";

export function DeleteTemplateButton({ id }: { id: number }) {
    const [isPending, startTransition] = useTransition();

    return (
        <Button
            variant="destructive"
            size="sm"
            disabled={isPending}
            onClick={() => {
                if (confirm("Are you sure?")) {
                    startTransition(async () => {
                        await deleteTemplate(id);
                    });
                }
            }}
        >
            {isPending ? "..." : "Delete"}
        </Button>
    );
}
