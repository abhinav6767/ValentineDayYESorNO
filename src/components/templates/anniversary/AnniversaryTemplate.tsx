"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./anniversary.module.css";
import { cn } from "@/lib/utils";

interface AnniversaryTemplateProps {
    content: {
        recipientName: string;
        years?: string;
        message?: string;
        photos?: string[];
        videoUrl?: string;
    };
}

export default function AnniversaryTemplate({ content }: AnniversaryTemplateProps) {
    const [stage, setStage] = useState<"intro" | "celebration">("intro");
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const initAudio = useCallback(() => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === "suspended") {
            audioCtxRef.current.resume();
        }
    }, []);

    const playChimeSound = useCallback(() => {
        initAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        // Elegant chime
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.8);
            osc.start(ctx.currentTime + i * 0.15);
            osc.stop(ctx.currentTime + i * 0.15 + 0.8);
        });
    }, [initAudio]);

    // Background animations
    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;

        // Gold sparkles floating up
        const sparkleInterval = setInterval(() => {
            const sparkle = document.createElement("div");
            sparkle.className = "anniversary-sparkle";
            sparkle.style.left = Math.random() * 100 + "vw";
            sparkle.style.animationDuration = (Math.random() * 4 + 5) + "s";
            const size = Math.random() * 4 + 2;
            sparkle.style.width = size + "px";
            sparkle.style.height = size + "px";
            container.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 10000);
        }, 200);

        // Floating rings & emojis
        const emojis = ["💍", "✨", "🥂", "🌟", "💫", "🥀", "🕊️", "💛", "⭐"];
        const emojiInterval = setInterval(() => {
            const emoji = document.createElement("div");
            emoji.className = "floating-ring";
            emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            emoji.style.left = Math.random() * 100 + "vw";
            emoji.style.fontSize = (18 + Math.random() * 20) + "px";
            emoji.style.animationDuration = (Math.random() * 4 + 5) + "s";
            container.appendChild(emoji);
            setTimeout(() => emoji.remove(), 10000);
        }, 500);

        return () => {
            clearInterval(sparkleInterval);
            clearInterval(emojiInterval);
        };
    }, []);

    const handleCelebrate = () => {
        if (videoRef.current) {
            setIsMuted(false);
            videoRef.current.muted = false;
            videoRef.current.play().catch(() => { });
        }
        playChimeSound();
        createCelebrationBurst();
        setStage("celebration");
        createGoldConfetti();
    };

    const createCelebrationBurst = () => {
        const emojis = ["💍", "✨", "🥂", "💛", "🌟", "💫", "🎊", "🎉", "💝", "🥀", "🕊️", "⭐", "💖"];
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        for (let wave = 0; wave < 3; wave++) {
            for (let i = 0; i < 40; i++) {
                setTimeout(() => {
                    const emoji = document.createElement("div");
                    emoji.className = "anniversary-burst";
                    emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                    const startX = centerX + (Math.random() - 0.5) * 100;
                    const startY = centerY + (Math.random() - 0.5) * 100;
                    emoji.style.left = startX + "px";
                    emoji.style.top = startY + "px";
                    emoji.style.fontSize = (24 + Math.random() * 48) + "px";
                    const angle = Math.random() * Math.PI * 2;
                    const distance = 300 + Math.random() * 600;
                    emoji.style.setProperty("--tx", Math.cos(angle) * distance + "px");
                    emoji.style.setProperty("--ty", Math.sin(angle) * distance + "px");
                    emoji.style.setProperty("--rot", (Math.random() * 1440 - 720) + "deg");
                    document.body.appendChild(emoji);
                    setTimeout(() => emoji.remove(), 2500);
                }, wave * 100 + i * 10);
            }
        }
    };

    const createGoldConfetti = () => {
        const shapes = ["✨", "💛", "⭐", "🌟", "💫", "💍", "🥂", "🎊"];
        for (let i = 0; i < 80; i++) {
            setTimeout(() => {
                const c = document.createElement("div");
                c.className = "gold-confetti";
                c.textContent = shapes[Math.floor(Math.random() * shapes.length)];
                c.style.fontSize = (Math.random() * 24 + 16) + "px";
                c.style.left = Math.random() * 100 + "%";
                c.style.top = "-20px";
                c.style.animationDuration = (Math.random() * 2 + 2) + "s";
                document.body.appendChild(c);
                setTimeout(() => c.remove(), 4000);
            }, i * 40);
        }
    };

    const toggleMusic = () => {
        if (videoRef.current) {
            const newMuted = !isMuted;
            videoRef.current.muted = newMuted;
            setIsMuted(newMuted);
            if (!newMuted) videoRef.current.play().catch(() => { });
        }
    };

    return (
        <div className={styles.container} ref={containerRef}>
            <video
                ref={videoRef}
                className={styles.backgroundVideo}
                autoPlay
                loop
                muted={isMuted}
                playsInline
            >
                {content.videoUrl && <source src={content.videoUrl} type="video/mp4" />}
            </video>

            <button className={cn(styles.musicToggle, isMuted && styles.muted)} onClick={toggleMusic}>
                {isMuted ? "🔇" : "🎵"}
            </button>

            <div className={styles.anniversaryBoundary}>
                <div className={cn(styles.boundaryCorner, styles.cornerTl)}>💍</div>
                <div className={cn(styles.boundaryCorner, styles.cornerTr)}>💍</div>
                <div className={cn(styles.boundaryCorner, styles.cornerBl)}>💍</div>
                <div className={cn(styles.boundaryCorner, styles.cornerBr)}>💍</div>
            </div>

            <div className={styles.particlesContainer}></div>

            {stage === "intro" && (
                <div className={styles.card}>
                    <div className={styles.ringIcon}>💍</div>
                    {content.years && (
                        <h1 className={styles.yearsText}>{content.years} Years</h1>
                    )}
                    <h1 className={styles.name}>{content.recipientName || "My Love"},</h1>
                    <h2 className={styles.subtitle}>Happy Anniversary! 🥂</h2>
                    {content.message && (
                        <p className={styles.message}>&ldquo;{content.message}&rdquo;</p>
                    )}
                    <button className={cn(styles.btn, styles.btnCelebrate)} onClick={handleCelebrate}>
                        🎉 Celebrate Together
                    </button>
                </div>
            )}

            {stage === "celebration" && (
                <div className={styles.successCard}>
                    <div className={styles.ringIcon}>🥂</div>
                    <h1 className={styles.successTitle}>To Us! ✨</h1>
                    <p className={styles.successMessage}>
                        {content.message || "Every moment with you is a treasure. Here's to many more years of love, laughter, and adventure together."}
                    </p>
                    <p className={styles.signature}>Forever yours 💛</p>
                </div>
            )}
        </div>
    );
}
