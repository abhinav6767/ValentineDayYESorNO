"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./proposal.module.css";
import { cn } from "@/lib/utils";

interface ProposalTemplateProps {
    content: {
        recipientName: string;
        message?: string;
        photos?: string[];
        videoUrl?: string;
    };
}

export default function ProposalTemplate({ content }: ProposalTemplateProps) {
    const [stage, setStage] = useState<"question" | "success">("question");
    const [noBtnPosition, setNoBtnPosition] = useState<{ top: number; left: number } | null>(null);
    const [noHoverCount, setNoHoverCount] = useState(0);
    const [showThinkAgain, setShowThinkAgain] = useState(false);
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

    const playWhooshSound = useCallback(() => {
        initAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = "sawtooth";
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2000, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    }, [initAudio]);

    const playMagicChime = useCallback(() => {
        initAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        // Dreamy ascending chime
        const notes = [392, 493.88, 587.33, 783.99, 987.77]; // G4, B4, D5, G5, B5
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
            osc.connect(gain);
            gain.connect(ctx.destination);
            gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 1);
            osc.start(ctx.currentTime + i * 0.12);
            osc.stop(ctx.currentTime + i * 0.12 + 1);
        });
    }, [initAudio]);

    // Background animations
    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;

        // Sparkles
        const sparkleInterval = setInterval(() => {
            const sparkle = document.createElement("div");
            sparkle.className = "proposal-sparkle";
            sparkle.style.left = Math.random() * 100 + "vw";
            sparkle.style.animationDuration = (Math.random() * 4 + 5) + "s";
            const size = Math.random() * 5 + 2;
            sparkle.style.width = size + "px";
            sparkle.style.height = size + "px";
            container.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 10000);
        }, 180);

        // Floating roses and emojis
        const emojis = ["🌹", "💍", "✨", "💎", "🌸", "💕", "🦋", "💫", "🌺", "💝"];
        const emojiInterval = setInterval(() => {
            const emoji = document.createElement("div");
            emoji.className = "floating-rose";
            emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            emoji.style.left = Math.random() * 100 + "vw";
            emoji.style.fontSize = (18 + Math.random() * 22) + "px";
            emoji.style.animationDuration = (Math.random() * 4 + 5) + "s";
            container.appendChild(emoji);
            setTimeout(() => emoji.remove(), 10000);
        }, 400);

        return () => {
            clearInterval(sparkleInterval);
            clearInterval(emojiInterval);
        };
    }, []);

    const handleNoHover = (e: React.MouseEvent | React.TouchEvent) => {
        if (videoRef.current && isMuted) {
            setIsMuted(false);
            videoRef.current.muted = false;
            videoRef.current.play().catch(() => { });
        }
        playWhooshSound();

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const centerX = vw / 2 - 50;
        const centerY = vh / 2 - 25;
        const positions = [
            { x: centerX - 80, y: centerY - 60 }, { x: centerX + 80, y: centerY - 60 },
            { x: centerX - 100, y: centerY }, { x: centerX + 100, y: centerY },
            { x: centerX - 80, y: centerY + 60 }, { x: centerX + 80, y: centerY + 60 },
            { x: centerX, y: centerY - 80 }, { x: centerX, y: centerY + 80 }
        ];

        if (noHoverCount >= 5) {
            setNoBtnPosition({ top: -9999, left: -9999 });
            setShowThinkAgain(true);
            return;
        }

        setNoHoverCount(prev => prev + 1);
        const pos = positions[Math.floor(Math.random() * positions.length)];
        const finalX = Math.max(50, Math.min(window.innerWidth - 150, pos.x));
        const finalY = Math.max(50, Math.min(window.innerHeight - 100, pos.y));
        setNoBtnPosition({ top: finalY, left: finalX });
    };

    const handleYesClick = () => {
        if (videoRef.current) {
            setIsMuted(false);
            videoRef.current.muted = false;
            videoRef.current.play().catch(() => { });
        }
        playMagicChime();
        createRingExpand();
        setTimeout(() => {
            createProposalBurst();
            createProposalConfetti();
            setStage("success");
        }, 600);
    };

    const createRingExpand = () => {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const ring = document.createElement("div");
                ring.className = "proposal-ring-expand";
                ring.style.left = (window.innerWidth / 2) + "px";
                ring.style.top = (window.innerHeight / 2) + "px";
                ring.style.transform = "translate(-50%, -50%)";
                document.body.appendChild(ring);
                setTimeout(() => ring.remove(), 1500);
            }, i * 200);
        }
    };

    const createProposalBurst = () => {
        const emojis = ["💍", "💎", "✨", "🌹", "💕", "🦋", "💫", "🎊", "🎉", "💖", "🌸", "💝", "🥂"];
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        for (let wave = 0; wave < 3; wave++) {
            for (let i = 0; i < 45; i++) {
                setTimeout(() => {
                    const emoji = document.createElement("div");
                    emoji.className = "proposal-burst";
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

    const createProposalConfetti = () => {
        const shapes = ["💍", "✨", "💎", "🌹", "🌸", "💕", "🦋", "💫"];
        for (let i = 0; i < 80; i++) {
            setTimeout(() => {
                const c = document.createElement("div");
                c.className = "proposal-confetti";
                c.textContent = shapes[Math.floor(Math.random() * shapes.length)];
                c.style.fontSize = (Math.random() * 24 + 16) + "px";
                c.style.left = Math.random() * 100 + "%";
                c.style.top = "-20px";
                c.style.animationDuration = (Math.random() * 2 + 2) + "s";
                document.body.appendChild(c);
                setTimeout(() => c.remove(), 4000);
            }, i * 35);
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
            <video ref={videoRef} className={styles.backgroundVideo} autoPlay loop muted={isMuted} playsInline>
                {content.videoUrl && <source src={content.videoUrl} type="video/mp4" />}
            </video>

            <button className={cn(styles.musicToggle, isMuted && styles.muted)} onClick={toggleMusic}>
                {isMuted ? "🔇" : "🎵"}
            </button>

            <div className={styles.proposalBoundary}>
                <div className={cn(styles.boundaryCorner, styles.cornerTl)}>💎</div>
                <div className={cn(styles.boundaryCorner, styles.cornerTr)}>💎</div>
                <div className={cn(styles.boundaryCorner, styles.cornerBl)}>💎</div>
                <div className={cn(styles.boundaryCorner, styles.cornerBr)}>💎</div>
            </div>

            <div className={styles.particlesContainer}></div>

            {stage === "question" && (
                <div className={styles.card}>
                    <div className={styles.ringIcon}>💍</div>
                    <h1 className={styles.name}>{content.recipientName || "My Love"},</h1>
                    <h2 className={styles.question}>Will You Marry Me? 💍</h2>
                    <p className={styles.subtitle}>My heart chose you a long time ago...</p>

                    <div className={styles.buttonsContainer}>
                        <button className={cn(styles.btn, styles.btnYes)} onClick={handleYesClick}>
                            Yes, I Will! 💕
                        </button>
                        {!showThinkAgain && (
                            <button
                                className={cn(styles.btn, styles.btnNo)}
                                style={noBtnPosition ? { position: "fixed", top: noBtnPosition.top, left: noBtnPosition.left, zIndex: 9999 } : {}}
                                onMouseEnter={handleNoHover}
                                onTouchStart={handleNoHover}
                            >
                                No
                            </button>
                        )}
                    </div>

                    {noHoverCount > 0 && !showThinkAgain && (
                        <p className={styles.subtitle} style={{ marginBottom: 0, color: "rgba(255,255,255,0.5)" }}>
                            You can&apos;t escape destiny! 💫
                        </p>
                    )}

                    {showThinkAgain && (
                        <div className={cn(styles.thinkAgainWrapper, styles.show)}>
                            <button className={cn(styles.btn, styles.btnNo)} onMouseEnter={handleNoHover}>
                                Think again! 💭
                            </button>
                        </div>
                    )}
                </div>
            )}

            {stage === "success" && (
                <div className={styles.successCard}>
                    <div className={styles.ringIcon}>💍✨</div>
                    <h1 className={styles.successTitle}>She Said Yes!</h1>
                    <p className={styles.successMessage}>
                        {content.message || "From this moment, every sunrise is ours to share. Every adventure, every dream — together. Forever."}
                    </p>
                    <p className={styles.signature}>Forever & Always 💕</p>
                </div>
            )}
        </div>
    );
}
