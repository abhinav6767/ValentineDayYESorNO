"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./valentine.module.css";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ValentineTemplateProps {
    content: {
        recipientName: string;
        message?: string; // Used for success message or hint?
        photos?: string[];
        videoUrl?: string; // Optional background video override
    };
}

export default function ValentineTemplate({ content }: ValentineTemplateProps) {
    const [stage, setStage] = useState<"question" | "success">("question");
    const [noBtnPosition, setNoBtnPosition] = useState<{ top: number; left: number } | null>(null);
    const [noHoverCount, setNoHoverCount] = useState(0);
    const [showThinkAgain, setShowThinkAgain] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);

    // Initialize Audio Context on interaction
    const initAudio = useCallback(() => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === "suspended") {
            audioCtxRef.current.resume();
        }
    }, []);

    // --- Audio Effects (Ported from legacy) ---
    const playWhooshSound = useCallback(() => {
        initAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = "sawtooth";
        osc2.type = "sine";
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2000, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.12);
        osc2.frequency.setValueAtTime(400, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

        osc.start();
        osc2.start();
        osc.stop(ctx.currentTime + 0.15);
        osc2.stop(ctx.currentTime + 0.15);
    }, [initAudio]);

    const playBurstSound = useCallback(() => {
        initAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) return;

        const pop = ctx.createOscillator();
        const popGain = ctx.createGain();
        pop.connect(popGain);
        popGain.connect(ctx.destination);
        pop.frequency.setValueAtTime(800, ctx.currentTime);
        pop.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
        popGain.gain.setValueAtTime(0.8, ctx.currentTime);
        popGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        pop.start();
        pop.stop(ctx.currentTime + 0.15);
    }, [initAudio]);


    // --- Background Animations ---
    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;

        // Floating Hearts
        const colors = ['#E91E63', '#FF6B9D', '#FF1493', '#FF69B4', '#FFB6C1'];
        const heartInterval = setInterval(() => {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            const size = Math.random() * 20 + 12;
            heart.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 32 32"><path d="M16 28C16 28 3 18 3 10C3 5.58 6.58 2 11 2C13.5 2 15.5 3.5 16 4C16.5 3.5 18.5 2 21 2C25.42 2 29 5.58 29 10C29 18 16 28 16 28Z" fill="${colors[Math.floor(Math.random() * colors.length)]}"/></svg>`;
            heart.style.left = Math.random() * 100 + 'vw';
            heart.style.animationDuration = (Math.random() * 4 + 6) + 's';
            container.appendChild(heart);
            setTimeout(() => heart.remove(), 11000);
        }, 600);

        // Floating Emojis
        const emojis = ['💕', '💖', '💗', '✨', '🌟', '💝', '🩷', '💓', '❤️', '💘', '🥰', '😍', '🌸', '🦋', '⭐', '💫'];
        const emojiInterval = setInterval(() => {
            const emoji = document.createElement('div');
            emoji.className = 'floating-emoji';
            emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            emoji.style.left = Math.random() * 100 + 'vw';
            emoji.style.fontSize = (18 + Math.random() * 20) + 'px';
            emoji.style.animationDuration = (Math.random() * 4 + 5) + 's';
            container.appendChild(emoji);
            setTimeout(() => emoji.remove(), 10000);
        }, 400);

        // Shooting Stars
        const starInterval = setInterval(() => {
            const star = document.createElement('div');
            star.className = 'shooting-star';
            star.style.top = (Math.random() * 40) + '%';
            star.style.left = (50 + Math.random() * 50) + '%';
            star.style.animationDuration = (1.2 + Math.random() * 0.6) + 's';
            container.appendChild(star);
            setTimeout(() => star.remove(), 3000);
        }, 1500);

        return () => {
            clearInterval(heartInterval);
            clearInterval(emojiInterval);
            clearInterval(starInterval);
        };
    }, []);

    // --- Interaction Logic ---
    const createSparkles = (x: number, y: number) => {
        const colors = ['#FF6B9D', '#FFD700', '#FF69B4', '#FFC0CB'];
        for (let i = 0; i < 6; i++) {
            const s = document.createElement('div');
            s.className = 'sparkle';
            s.style.left = x + 'px';
            s.style.top = y + 'px';
            s.style.background = colors[Math.floor(Math.random() * colors.length)];
            const angle = (Math.PI * 2 * i) / 6;
            s.style.setProperty('--tx', Math.cos(angle) * 25 + 'px');
            s.style.setProperty('--ty', Math.sin(angle) * 25 + 'px');
            document.body.appendChild(s); // Append to body to avoid clipping
            setTimeout(() => s.remove(), 500);
        }
    };

    const handleNoHover = (e: React.MouseEvent | React.TouchEvent) => {
        // Unmute on first interaction
        if (videoRef.current && isMuted) {
            setIsMuted(false);
            videoRef.current.muted = false;
            videoRef.current.play().catch(() => { });
        }

        playWhooshSound();

        // Safe positions logic
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

        let rect: DOMRect;
        if (e.target instanceof HTMLElement) {
            rect = e.target.getBoundingClientRect();
            createSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }

        if (noHoverCount >= 5) {
            setNoBtnPosition({ top: -9999, left: -9999 });
            setShowThinkAgain(true);
            return;
        }

        setNoHoverCount(prev => prev + 1);

        // Pick next random safe position
        const pos = positions[Math.floor(Math.random() * positions.length)];
        // Ensure it stays within bounds
        const finalX = Math.max(50, Math.min(window.innerWidth - 150, pos.x));
        const finalY = Math.max(50, Math.min(window.innerHeight - 100, pos.y));

        setNoBtnPosition({ top: finalY, left: finalX });
        setTimeout(() => createSparkles(finalX + 50, finalY + 25), 150);
    };

    const playInflateSound = useCallback(() => {
        initAudio();
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    }, [initAudio]);

    const handleYesClick = (e: React.MouseEvent) => {
        // Unmute
        if (videoRef.current) {
            setIsMuted(false);
            videoRef.current.muted = false;
            videoRef.current.play().catch(() => { });
        }

        const btn = e.currentTarget as HTMLElement;
        const btnRect = btn.getBoundingClientRect();
        btn.style.visibility = 'hidden';

        // Create balloon
        const balloon = document.createElement('div');
        balloon.className = 'heart-balloon-container';
        balloon.innerHTML = `
            <div class="heart-balloon">
                <div class="heart-balloon-emojis"></div>
            </div>
        `;
        document.body.appendChild(balloon);

        const heartBalloon = balloon.querySelector('.heart-balloon') as HTMLElement;
        const emojiContainer = balloon.querySelector('.heart-balloon-emojis') as HTMLElement;

        heartBalloon.style.left = btnRect.left + 'px';
        heartBalloon.style.top = btnRect.top + 'px';
        heartBalloon.style.width = btnRect.width + 'px';
        heartBalloon.style.height = btnRect.height + 'px';

        const valentineEmojis = ['❤️', '💕', '💖', '💗', '💓', '💝', '💘', '💞', '🌹', '💐', '🥰', '😍', '💑', '💏', '💋', '🫶', '💌', '🩷', '♥️', '😘'];
        let size = 0;
        let wobblePhase = 0;
        const maxSize = Math.max(window.innerWidth, window.innerHeight) * 1.3;

        const growInterval = setInterval(() => {
            size += 12;
            wobblePhase += 0.3;
            const wobbleX = Math.sin(wobblePhase) * 0.05 + 1;
            const wobbleY = Math.cos(wobblePhase) * 0.05 + 1;
            const baseWidth = btnRect.width + size;
            const baseHeight = btnRect.height + size * 1.1;
            const newWidth = baseWidth * wobbleX;
            const newHeight = baseHeight * wobbleY;

            heartBalloon.style.width = newWidth + 'px';
            heartBalloon.style.height = newHeight + 'px';
            heartBalloon.style.left = (window.innerWidth / 2 - newWidth / 2) + 'px';
            heartBalloon.style.top = (window.innerHeight / 2 - newHeight / 2) + 'px';

            if (size % 60 === 0) playInflateSound();

            if (size % 15 === 0) {
                const emoji = document.createElement('span');
                emoji.className = 'balloon-emoji-inside';
                emoji.textContent = valentineEmojis[Math.floor(Math.random() * valentineEmojis.length)];
                emoji.style.left = (5 + Math.random() * 90) + '%';
                emoji.style.top = (5 + Math.random() * 90) + '%';
                emoji.style.fontSize = (12 + Math.random() * 28) + 'px';
                emojiContainer.appendChild(emoji);
            }

            if (size >= maxSize) {
                clearInterval(growInterval);
                heartBalloon.classList.add('shake');
                setTimeout(() => {
                    playBurstSound();
                    heartBalloon.classList.add('burst');
                    createMassiveEmojiBurst();
                    setStage("success");
                    createConfetti();
                    setTimeout(() => balloon.remove(), 600);
                }, 500);
            }
        }, 20);
    };

    const createMassiveEmojiBurst = () => {
        const emojis = ['❤️', '💕', '💖', '💗', '💓', '💝', '💘', '💞', '🌹', '💐', '🥰', '😍', '✨', '🎉', '💑', '💋', '🫶', '💌', '🩷', '♥️', '🎊', '💥'];
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        for (let wave = 0; wave < 3; wave++) {
            for (let i = 0; i < 50; i++) {
                setTimeout(() => {
                    const emoji = document.createElement('div');
                    emoji.className = 'burst-emoji';
                    emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                    const startX = centerX + (Math.random() - 0.5) * 100;
                    const startY = centerY + (Math.random() - 0.5) * 100;
                    emoji.style.left = startX + 'px';
                    emoji.style.top = startY + 'px';
                    emoji.style.fontSize = (24 + Math.random() * 48) + 'px';

                    const angle = Math.random() * Math.PI * 2;
                    const distance = 400 + Math.random() * 800;
                    emoji.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
                    emoji.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
                    emoji.style.setProperty('--rot', (Math.random() * 1440 - 720) + 'deg');

                    document.body.appendChild(emoji);
                    setTimeout(() => emoji.remove(), 2500);
                }, wave * 100 + i * 8);
            }
        }
    };

    const createConfetti = useCallback(() => {
        const shapes = ['❤️', '💕', '💖', '✨', '🎉', '💝', '🌹', '💗', '🩷', '🎊'];
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const c = document.createElement('div');
                c.className = 'confetti';
                c.textContent = shapes[Math.floor(Math.random() * shapes.length)];
                c.style.fontSize = (Math.random() * 24 + 16) + 'px';
                c.style.left = Math.random() * 100 + '%';
                c.style.top = '-20px'; // Start above
                c.style.animationDuration = (Math.random() * 2 + 2) + 's';
                document.body.appendChild(c);
                setTimeout(() => c.remove(), 4000);
            }, i * 30);
        }
        createPolaroidGallery();
    }, []);

    const createPolaroidGallery = useCallback(() => {
        if (!content.photos || content.photos.length === 0) return;
        const polaroidContainer = document.createElement('div');
        polaroidContainer.className = 'polaroid-container';
        document.body.appendChild(polaroidContainer);

        let photoIndex = 0;
        const createPolaroid = () => {
            if (photoIndex >= content.photos!.length) photoIndex = 0;
            const polaroid = document.createElement('div');
            polaroid.className = 'polaroid';

            polaroid.innerHTML = `
                <div class="polaroid-photo">
                    <img src="${content.photos![photoIndex]}" alt="Memory" loading="eager">
                </div>
                <div class="polaroid-caption">💕</div>
             `;

            polaroid.style.left = (5 + Math.random() * 90) + '%';
            polaroid.style.animationDuration = (12 + Math.random() * 4) + 's';
            polaroid.style.setProperty('--rot', ((Math.random() - 0.5) * 20) + 'deg');

            polaroidContainer.appendChild(polaroid);
            photoIndex++;
            setTimeout(() => polaroid.remove(), 20000);
        };

        // Initial batch
        for (let i = 0; i < 10; i++) {
            setTimeout(createPolaroid, i * 300);
        }
        // Continuous
        setInterval(createPolaroid, 1000);

    }, [content.photos]);


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
            {/* Background Video */}
            <video
                ref={videoRef}
                className={styles.backgroundVideo}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                id="bgVideo"
            >
                <source src={content.videoUrl || "/templates/valentine/Video/Perfect.mp4"} type="video/mp4" />
            </video>

            <button className={cn(styles.musicToggle, isMuted && styles.muted)} onClick={toggleMusic}>
                {isMuted ? "🔇" : "🎵"}
            </button>

            <div className={styles.valentineBoundary}>
                <div className={cn(styles.boundaryCorner, styles.cornerTl)}>💕</div>
                <div className={cn(styles.boundaryCorner, styles.cornerTr)}>💕</div>
                <div className={cn(styles.boundaryCorner, styles.cornerBl)}>💕</div>
                <div className={cn(styles.boundaryCorner, styles.cornerBr)}>💕</div>
            </div>

            <div className={styles.heartsContainer}></div>

            {stage === "question" && (
                <div className={styles.card}>
                    <div className={styles.heartIcon}>
                        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 28C16 28 3 18 3 10C3 5.58172 6.58172 2 11 2C13.5 2 15.5 3.5 16 4C16.5 3.5 18.5 2 21 2C25.4183 2 29 5.58172 29 10C29 18 16 28 16 28Z" fill="#ff6b9d" />
                        </svg>
                    </div>

                    <h1 className={styles.name}>{content.recipientName || "Valentine"},</h1>
                    <h2 className={styles.question}>will you be my valentine?</h2>

                    <div className={styles.buttonsContainer}>
                        <button className={cn(styles.btn, styles.btnYes)} onClick={handleYesClick}>Yes!</button>

                        {!showThinkAgain && (
                            <button
                                className={cn(styles.btn, styles.btnNo)}
                                style={noBtnPosition ? { position: 'fixed', top: noBtnPosition.top, left: noBtnPosition.left, zIndex: 9999 } : {}}
                                onMouseEnter={handleNoHover}
                                onTouchStart={handleNoHover}
                            >
                                No
                            </button>
                        )}
                    </div>

                    {noHoverCount > 0 && !showThinkAgain && <p className={styles.question} style={{ fontSize: '1rem', marginTop: '10px' }}>It really wants you to say yes!</p>}

                    {showThinkAgain && (
                        <div className={cn(styles.thinkAgainWrapper, styles.show)}>
                            <button
                                className={cn(styles.btn, styles.btnNo)} // Reuse styling
                                onMouseEnter={handleNoHover} // Move this too!
                            >
                                Think again!
                            </button>
                        </div>
                    )}
                </div>
            )}

            {stage === "success" && (
                <div className={styles.successCard}>
                    <div className={styles.heartIcon}>
                        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16 28C16 28 3 18 3 10C3 5.58172 6.58172 2 11 2C13.5 2 15.5 3.5 16 4C16.5 3.5 18.5 2 21 2C25.4183 2 29 5.58172 29 10C29 18 16 28 16 28Z" fill="#E91E63" />
                        </svg>
                    </div>
                    <h1 className={styles.name} style={{ fontSize: '3rem' }}>I knew it.</h1>
                    <p className={styles.question}>See you soon.</p>
                    <p style={{ fontFamily: 'Dancing Script, cursive', fontSize: '2rem', color: '#E91E63' }}>Love</p>

                    {/* Photos are now handled by createPolaroidGallery */}
                </div>
            )}
        </div>
    );
}
