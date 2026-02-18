"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./birthday.module.css";
import { cn } from "@/lib/utils";

interface BirthdayTemplateProps {
    content: {
        recipientName: string;
        age?: string;
        message?: string;
        photos?: string[];
        videoUrl?: string;
    };
}

export default function BirthdayTemplate({ content }: BirthdayTemplateProps) {
    const [stage, setStage] = useState<"intro" | "celebration">("intro");
    const [candlesBlown, setCandlesBlown] = useState(false);
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

    const playPartyHorn = useCallback(() => {
        initAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        // Party horn sound
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc2.type = "square";
        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.3);
        osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.5);
        osc2.frequency.setValueAtTime(300, ctx.currentTime);
        osc2.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start();
        osc2.start();
        osc.stop(ctx.currentTime + 0.6);
        osc2.stop(ctx.currentTime + 0.6);
    }, [initAudio]);

    const playBlowSound = useCallback(() => {
        initAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        // Soft whoosh for candle blow
        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        source.start();
    }, [initAudio]);

    // Background animations
    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;

        // Colorful sparkles
        const colors = ["#ff6f00", "#ffab00", "#ff1744", "#00e5ff", "#76ff03", "#d500f9"];
        const sparkleInterval = setInterval(() => {
            const sparkle = document.createElement("div");
            sparkle.className = "birthday-sparkle";
            sparkle.style.left = Math.random() * 100 + "vw";
            sparkle.style.animationDuration = (Math.random() * 4 + 5) + "s";
            const size = Math.random() * 5 + 2;
            sparkle.style.width = size + "px";
            sparkle.style.height = size + "px";
            sparkle.style.background = colors[Math.floor(Math.random() * colors.length)];
            sparkle.style.boxShadow = `0 0 6px 2px ${sparkle.style.background}80`;
            container.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 10000);
        }, 200);

        // Floating balloons and emojis
        const emojis = ["🎈", "🎉", "🎊", "🎁", "🧁", "🎂", "⭐", "✨", "🎵", "🥳", "🎶", "💫"];
        const emojiInterval = setInterval(() => {
            const emoji = document.createElement("div");
            emoji.className = "floating-balloon";
            emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            emoji.style.left = Math.random() * 100 + "vw";
            emoji.style.fontSize = (20 + Math.random() * 24) + "px";
            emoji.style.animationDuration = (Math.random() * 4 + 5) + "s";
            container.appendChild(emoji);
            setTimeout(() => emoji.remove(), 10000);
        }, 400);

        return () => {
            clearInterval(sparkleInterval);
            clearInterval(emojiInterval);
        };
    }, []);

    const handleBlowCandles = () => {
        if (videoRef.current) {
            setIsMuted(false);
            videoRef.current.muted = false;
            videoRef.current.play().catch(() => { });
        }
        playBlowSound();
        setCandlesBlown(true);

        setTimeout(() => {
            playPartyHorn();
            createBirthdayBurst();
            createBirthdayConfetti();
            setStage("celebration");
        }, 1000);
    };

    const createBirthdayBurst = () => {
        const emojis = ["🎈", "🎉", "🎊", "🎁", "🥳", "✨", "🎂", "🧁", "⭐", "🎵", "💫", "🎶", "🥂", "💛"];
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        for (let wave = 0; wave < 3; wave++) {
            for (let i = 0; i < 45; i++) {
                setTimeout(() => {
                    const emoji = document.createElement("div");
                    emoji.className = "birthday-burst";
                    emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                    emoji.style.left = (centerX + (Math.random() - 0.5) * 100) + "px";
                    emoji.style.top = (centerY + (Math.random() - 0.5) * 100) + "px";
                    emoji.style.fontSize = (24 + Math.random() * 48) + "px";
                    const angle = Math.random() * Math.PI * 2;
                    const distance = 300 + Math.random() * 700;
                    emoji.style.setProperty("--tx", Math.cos(angle) * distance + "px");
                    emoji.style.setProperty("--ty", Math.sin(angle) * distance + "px");
                    emoji.style.setProperty("--rot", (Math.random() * 1440 - 720) + "deg");
                    document.body.appendChild(emoji);
                    setTimeout(() => emoji.remove(), 2500);
                }, wave * 100 + i * 8);
            }
        }
    };

    const createBirthdayConfetti = () => {
        const shapes = ["🎈", "🎉", "✨", "🎊", "🎁", "⭐", "🥳", "🎂"];
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const c = document.createElement("div");
                c.className = "birthday-confetti";
                c.textContent = shapes[Math.floor(Math.random() * shapes.length)];
                c.style.fontSize = (Math.random() * 24 + 16) + "px";
                c.style.left = Math.random() * 100 + "%";
                c.style.top = "-20px";
                c.style.animationDuration = (Math.random() * 2 + 2) + "s";
                document.body.appendChild(c);
                setTimeout(() => c.remove(), 4000);
            }, i * 30);
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

    const numCandles = content.age ? Math.min(parseInt(content.age) || 5, 10) : 5;

    return (
        <div className={styles.container} ref={containerRef}>
            <video ref={videoRef} className={styles.backgroundVideo} autoPlay loop muted={isMuted} playsInline>
                {content.videoUrl && <source src={content.videoUrl} type="video/mp4" />}
            </video>

            <button className={cn(styles.musicToggle, isMuted && styles.muted)} onClick={toggleMusic}>
                {isMuted ? "🔇" : "🎵"}
            </button>

            <div className={styles.birthdayBoundary}>
                <div className={cn(styles.boundaryCorner, styles.cornerTl)}>🎈</div>
                <div className={cn(styles.boundaryCorner, styles.cornerTr)}>🎉</div>
                <div className={cn(styles.boundaryCorner, styles.cornerBl)}>🎊</div>
                <div className={cn(styles.boundaryCorner, styles.cornerBr)}>🎁</div>
            </div>

            <div className={styles.particlesContainer}></div>

            {stage === "intro" && (
                <div className={styles.card}>
                    <div className={styles.cakeIcon}>🎂</div>

                    {/* Candles */}
                    <div className={styles.candlesRow}>
                        {Array.from({ length: numCandles }).map((_, i) => (
                            <div key={i} className={cn(styles.candle, candlesBlown && styles.blownOut)}>
                                <span className={styles.flame}>{candlesBlown ? "💨" : "🔥"}</span>
                                <div className={styles.candleBody} />
                            </div>
                        ))}
                    </div>

                    <h1 className={styles.name}>{content.recipientName || "Birthday Star"}!</h1>
                    <h2 className={styles.question}>Happy Birthday! 🥳</h2>
                    {content.age && (
                        <p className={styles.subtitle}>Turning {content.age} and more amazing than ever!</p>
                    )}
                    {content.message && (
                        <p className={styles.message}>&ldquo;{content.message}&rdquo;</p>
                    )}
                    <button className={cn(styles.btn, styles.btnCelebrate)} onClick={handleBlowCandles}>
                        🎂 Blow the Candles!
                    </button>
                </div>
            )}

            {stage === "celebration" && (
                <div className={styles.successCard}>
                    <div className={styles.cakeIcon}>🥳</div>
                    <h1 className={styles.successTitle}>Make a Wish! ✨</h1>
                    <p className={styles.successMessage}>
                        {content.message || "May all your dreams come true this year and always. You deserve the world and more! Here's to another incredible year. 🎉"}
                    </p>
                    <p className={styles.signature}>With love 🎁</p>
                </div>
            )}
        </div>
    );
}
