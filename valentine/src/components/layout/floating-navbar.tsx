"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Image from "next/image";

function CreditsBadge() {
    const [credits, setCredits] = useState<number | null>(null);

    const fetchCredits = () => {
        fetch("/api/credits/balance")
            .then((r) => r.json())
            .then((d) => setCredits(d.credits))
            .catch(() => { });
    };

    useEffect(() => {
        fetchCredits();
        const handler = () => fetchCredits();
        window.addEventListener("credits-updated", handler);
        return () => window.removeEventListener("credits-updated", handler);
    }, []);

    if (credits === null) return null;

    return (
        <Link
            href="/dashboard#credits"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-400/30 dark:border-amber-500/20 text-xs font-bold text-amber-700 dark:text-amber-300 hover:from-amber-500/20 hover:to-yellow-500/20 transition-all"
            title="Your credits"
        >
            <span>🪙</span>
            <span>{credits}</span>
        </Link>
    );
}

export const FloatingNav = ({ className }: { className?: string }) => {
    const { data: session } = useSession();

    return (
        <div
            className={cn(
                "flex max-w-fit fixed top-4 inset-x-0 mx-auto border border-neutral-200/50 dark:border-white/10 rounded-full bg-white/70 dark:bg-black/60 shadow-lg dark:shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] pr-2 pl-6 py-2 items-center justify-center gap-3 backdrop-blur-2xl backdrop-saturate-150",
                className
            )}
        >
            <Link
                href="/"
                className="relative items-center flex space-x-1"
            >
                <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-600">OmniTemplates</span>
            </Link>

            <div className="h-4 w-[1px] bg-neutral-300 dark:bg-neutral-700" />

            <Link
                href="/#templates"
                className="text-sm text-neutral-600 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
                Templates
            </Link>
            <Link
                href="/#how-it-works"
                className="text-sm text-neutral-600 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
                How it works
            </Link>

            <div className="h-4 w-[1px] bg-neutral-300 dark:bg-neutral-700" />

            <ThemeToggle />

            {session ? (
                <div className="flex items-center gap-2">
                    <CreditsBadge />
                    <Link
                        href="/dashboard"
                        className="text-sm text-neutral-600 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white transition-colors"
                    >
                        Dashboard
                    </Link>
                    {session.user?.image && (
                        <Image
                            src={session.user.image}
                            alt={session.user.name || "Profile"}
                            width={28}
                            height={28}
                            className="rounded-full ring-2 ring-pink-500/50"
                        />
                    )}
                    <Button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        variant="ghost"
                        size="sm"
                        className="text-xs border border-neutral-300 dark:border-white/20 text-neutral-700 dark:text-white px-3 py-1 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
                    >
                        Logout
                    </Button>
                </div>
            ) : (
                <Link href="/api/auth/signin">
                    <button className="border text-sm font-medium relative border-neutral-300 dark:border-white/20 text-neutral-700 dark:text-white px-4 py-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors">
                        <span>Login</span>
                        <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-pink-500 to-transparent h-px" />
                    </button>
                </Link>
            )}
        </div>
    );
};

