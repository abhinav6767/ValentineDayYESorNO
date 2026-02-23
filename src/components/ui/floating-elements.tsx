"use client";

import { motion } from "framer-motion";

const floatingItems = [
    { emoji: "💕", x: "10%", y: "20%", size: "text-3xl", duration: 6, delay: 0 },
    { emoji: "💍", x: "80%", y: "15%", size: "text-2xl", duration: 7, delay: 1 },
    { emoji: "🌟", x: "90%", y: "60%", size: "text-xl", duration: 5, delay: 0.5 },
    { emoji: "🏆", x: "5%", y: "70%", size: "text-2xl", duration: 8, delay: 2 },
    { emoji: "❤️", x: "70%", y: "80%", size: "text-3xl", duration: 6, delay: 1.5 },
    { emoji: "🎂", x: "30%", y: "10%", size: "text-xl", duration: 7, delay: 0.8 },
    { emoji: "💐", x: "60%", y: "40%", size: "text-2xl", duration: 5.5, delay: 1.2 },
    { emoji: "✨", x: "20%", y: "50%", size: "text-lg", duration: 4, delay: 0.3 },
    { emoji: "🎉", x: "45%", y: "75%", size: "text-xl", duration: 6.5, delay: 2.5 },
    { emoji: "💝", x: "85%", y: "35%", size: "text-2xl", duration: 7.5, delay: 0.7 },
];

export function FloatingElements() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {floatingItems.map((item, index) => (
                <motion.div
                    key={index}
                    className={`absolute ${item.size} select-none`}
                    style={{ left: item.x, top: item.y }}
                    animate={{
                        y: [0, -20, 0, 15, 0],
                        x: [0, 10, -5, 8, 0],
                        rotate: [0, 10, -10, 5, 0],
                        scale: [1, 1.1, 0.95, 1.05, 1],
                    }}
                    transition={{
                        duration: item.duration,
                        delay: item.delay,
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "easeInOut",
                    }}
                >
                    {item.emoji}
                </motion.div>
            ))}
        </div>
    );
}
