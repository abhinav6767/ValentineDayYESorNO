"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function WiggleBanner() {
    return (
        <div className="flex justify-center mb-10 relative z-10">
            <Link href="/api/auth/signin">
                <motion.div
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 dark:from-amber-500/15 dark:via-yellow-500/15 dark:to-amber-500/15 border-2 border-amber-400/40 dark:border-amber-500/30 cursor-pointer hover:border-amber-400/60 dark:hover:border-amber-500/50 transition-colors shadow-lg shadow-amber-500/5"
                    animate={{
                        rotate: [0, -1.5, 1.5, -1.5, 1.5, 0],
                        scale: [1, 1.02, 1, 1.02, 1],
                    }}
                    transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        repeatDelay: 2.5,
                        ease: "easeInOut",
                    }}
                    whileHover={{
                        scale: 1.05,
                        rotate: 0,
                    }}
                >
                    <span className="text-2xl">🎁</span>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="text-base sm:text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-yellow-500 dark:from-amber-400 dark:to-yellow-300">
                            Free 25 credits after signup
                        </span>
                        <span className="text-neutral-400 dark:text-neutral-500 hidden sm:inline">—</span>
                        <span className="text-sm sm:text-base font-semibold text-pink-500 dark:text-pink-400">
                            Write a review! ✍️
                        </span>
                    </div>
                    <motion.span
                        className="text-xl"
                        animate={{ rotate: [0, 15, -15, 15, 0] }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            repeatDelay: 3,
                            ease: "easeInOut",
                        }}
                    >
                        🪙
                    </motion.span>
                </motion.div>
            </Link>
        </div>
    );
}
