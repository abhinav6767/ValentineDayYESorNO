"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return <div className="w-14 h-7 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />;

    const isDark = theme === "dark";

    const handleToggle = () => {
        // Add a smooth transition class to the html element
        document.documentElement.classList.add("theme-transitioning");
        setTheme(isDark ? "light" : "dark");
        setTimeout(() => {
            document.documentElement.classList.remove("theme-transitioning");
        }, 700);
    };

    return (
        <motion.button
            onClick={handleToggle}
            className="relative w-14 h-7 rounded-full bg-gradient-to-r from-amber-200 to-orange-300 dark:from-indigo-800 dark:to-violet-900 transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 overflow-hidden"
            aria-label="Toggle theme"
            whileTap={{ scale: 0.9 }}
            layout
        >
            {/* Stars background (visible in dark mode) */}
            <AnimatePresence>
                {isDark && (
                    <>
                        <motion.span
                            className="absolute w-1 h-1 bg-white rounded-full"
                            style={{ top: "20%", left: "15%" }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1, 0.8] }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.span
                            className="absolute w-0.5 h-0.5 bg-white rounded-full"
                            style={{ top: "60%", left: "25%" }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.6, 1, 0.6] }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                        />
                        <motion.span
                            className="absolute w-0.5 h-0.5 bg-white rounded-full"
                            style={{ top: "35%", left: "40%" }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: [0.5, 1, 0.5], scale: [0.7, 1, 0.7] }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ duration: 1.8, repeat: Infinity, delay: 0.6 }}
                        />
                    </>
                )}
            </AnimatePresence>

            {/* Sliding knob with icon */}
            <motion.span
                className="absolute top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-lg"
                animate={{
                    left: isDark ? "calc(100% - 1.625rem)" : "0.125rem",
                    backgroundColor: isDark ? "#6366f1" : "#f59e0b",
                    rotate: isDark ? 360 : 0,
                }}
                transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    rotate: { duration: 0.5 },
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.span
                        key={isDark ? "moon" : "sun"}
                        initial={{ scale: 0, rotate: -180, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        exit={{ scale: 0, rotate: 180, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {isDark ? "🌙" : "☀️"}
                    </motion.span>
                </AnimatePresence>
            </motion.span>
        </motion.button>
    );
}
