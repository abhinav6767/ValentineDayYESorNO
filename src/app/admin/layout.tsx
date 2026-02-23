import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user || (session.user as any).role !== "ADMIN") {
        redirect("/");
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-10 w-full border-b bg-background">
                <div className="container flex h-16 items-center px-4">
                    <div className="mr-4 flex">
                        <Link href="/" className="mr-6 flex items-center space-x-2">
                            <span className="text-lg font-bold">OmniTemplates Admin</span>
                        </Link>
                        <nav className="flex items-center space-x-6 text-sm font-medium">
                            <Link
                                href="/admin"
                                className="transition-colors hover:text-foreground/80"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/admin/templates"
                                className="transition-colors hover:text-foreground/80"
                            >
                                Templates
                            </Link>
                            <Link
                                href="/admin/reviews"
                                className="transition-colors hover:text-foreground/80"
                            >
                                Reviews
                            </Link>
                            <Link
                                href="/admin/credits"
                                className="transition-colors hover:text-foreground/80"
                            >
                                Credits
                            </Link>
                            <Link
                                href="/admin/orders"
                                className="transition-colors hover:text-foreground/80"
                            >
                                Orders
                            </Link>
                        </nav>
                    </div>
                    <div className="ml-auto flex items-center space-x-4">
                        <span className="text-sm text-muted-foreground">Admin Mode</span>
                    </div>
                </div>
            </header>
            <main className="flex-1 space-y-4 p-8 pt-6">{children}</main>
        </div>
    );
}

