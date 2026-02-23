"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";

// ─── Types ───────────────────────────────────────────
interface Review {
    id: number;
    userId: string;
    text: string | null;
    rating: number;
    role: string | null;
    videoUrl: string | null;
    status: string;
    createdAt: string;
    user?: {
        name: string | null;
        image: string | null;
    };
}

type TabId = "all" | "video" | "text";

const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: "all", label: "All", icon: "✨" },
    { id: "video", label: "Video Testimonials", icon: "🎬" },
    { id: "text", label: "Text Reviews", icon: "💬" },
];

// ─── Animated Panda Easter Egg ──────────────────────
function PandaEasterEgg() {
    return (
        <motion.div
            className="absolute bottom-2 right-2 select-none pointer-events-none z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
        >
            <motion.div
                className="relative"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                {/* Panda body */}
                <div className="relative w-12 h-12">
                    {/* Body */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-9 bg-white rounded-full border border-neutral-200 dark:border-neutral-600" />
                    {/* Head */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-7 bg-white rounded-full border border-neutral-200 dark:border-neutral-600 z-10">
                        {/* Ears */}
                        <div className="absolute -top-1 -left-1 w-3 h-3 bg-neutral-800 rounded-full" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-neutral-800 rounded-full" />
                        {/* Eye patches */}
                        <div className="absolute top-2 left-1 w-2.5 h-2 bg-neutral-800 rounded-full rotate-[-10deg]">
                            <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full" />
                        </div>
                        <div className="absolute top-2 right-1 w-2.5 h-2 bg-neutral-800 rounded-full rotate-[10deg]">
                            <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full" />
                        </div>
                        {/* Nose */}
                        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1 bg-neutral-800 rounded-full" />
                    </div>
                    {/* Arms */}
                    <div className="absolute bottom-2 -left-0.5 w-2.5 h-4 bg-neutral-800 rounded-full rotate-[20deg] z-20" />
                    <motion.div
                        className="absolute bottom-2 -right-1 w-2.5 h-5 bg-neutral-800 rounded-full origin-bottom z-20"
                        animate={{ rotate: [-10, 15, -10] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        {/* Bamboo stick */}
                        <div className="absolute -top-4 left-0.5 w-1 h-6 bg-green-600 rounded-full">
                            {/* Bamboo leaves */}
                            <motion.div
                                className="absolute -top-1.5 -left-1.5 w-3 h-2 bg-green-500 rounded-full rotate-[-30deg]"
                                animate={{ rotate: [-30, -20, -30] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                            <motion.div
                                className="absolute -top-0.5 left-0.5 w-2.5 h-1.5 bg-green-400 rounded-full rotate-[20deg]"
                                animate={{ rotate: [20, 30, 20] }}
                                transition={{ duration: 1.2, repeat: Infinity }}
                            />
                        </div>
                    </motion.div>
                </div>
                {/* Munching animation */}
                <motion.div
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[6px] z-30"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    nom nom
                </motion.div>
            </motion.div>
        </motion.div>
    );
}

// ─── Star Rating Component ──────────────────────────
function StarRating({
    rating,
    onRate,
    interactive = false,
    size = "md",
}: {
    rating: number;
    onRate?: (r: number) => void;
    interactive?: boolean;
    size?: "sm" | "md";
}) {
    const [hover, setHover] = useState(0);
    const sizeClass = size === "sm" ? "text-sm" : "text-xl";

    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={!interactive}
                    className={`${sizeClass} transition-transform ${interactive ? "cursor-pointer hover:scale-125" : "cursor-default"}`}
                    onMouseEnter={() => interactive && setHover(star)}
                    onMouseLeave={() => interactive && setHover(0)}
                    onClick={() => onRate?.(star)}
                >
                    {star <= (hover || rating) ? "⭐" : "☆"}
                </button>
            ))}
        </div>
    );
}

// ─── Review Form Overlay ────────────────────────────
function ReviewFormOverlay({
    isOpen,
    onClose,
    onSubmit,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
}) {
    const [rating, setRating] = useState(0);
    const [text, setText] = useState("");
    const [role, setRole] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setError("Please select a star rating");
            return;
        }
        if (!text.trim()) {
            setError("Please write your review");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rating,
                    text: text.trim(),
                    role: role.trim() || undefined,
                    videoUrl: videoUrl.trim() || undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to submit review");
                return;
            }

            setSuccess(true);
            // Refresh the credits badge in the navbar
            window.dispatchEvent(new Event("credits-updated"));
            setTimeout(() => {
                onSubmit();
                onClose();
                // Reset form
                setRating(0);
                setText("");
                setRole("");
                setVideoUrl("");
                setSuccess(false);
            }, 2000);
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* Form */}
                    <motion.div
                        className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
                        initial={{ scale: 0.8, y: 50, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.8, y: 50, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        {/* Header gradient */}
                        <div className="h-2 bg-gradient-to-r from-pink-500 via-violet-500 to-indigo-500" />

                        <div className="p-6">
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-500 dark:text-neutral-400"
                            >
                                ✕
                            </button>

                            {success ? (
                                <motion.div
                                    className="text-center py-8"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", damping: 15 }}
                                >
                                    <div className="text-5xl mb-4">🎉</div>
                                    <h3 className="text-xl font-bold text-neutral-800 dark:text-white mb-2">
                                        Thank You!
                                    </h3>
                                    <p className="text-neutral-500 dark:text-neutral-400">
                                        Your review has been submitted.
                                        {videoUrl
                                            ? " It will appear after admin approval. You'll receive 40 credits!"
                                            : " You've earned 15 credits! 🪙"}
                                    </p>
                                </motion.div>
                            ) : (
                                <>
                                    <h3 className="text-xl font-bold text-neutral-800 dark:text-white mb-1">
                                        Share Your Experience ✍️
                                    </h3>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5">
                                        Earn <span className="text-pink-500 font-semibold">15 credits</span> for a text review
                                        or <span className="text-violet-500 font-semibold">40 credits</span> for a video review!
                                    </p>

                                    {error && (
                                        <motion.div
                                            className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg text-sm text-red-600 dark:text-red-400"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Star Rating */}
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                                Rating *
                                            </label>
                                            <StarRating rating={rating} onRate={setRating} interactive />
                                        </div>

                                        {/* Review Text */}
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                                Your Review *
                                            </label>
                                            <textarea
                                                value={text}
                                                onChange={(e) => setText(e.target.value)}
                                                placeholder="Tell us about your experience..."
                                                className="w-full h-24 px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none transition-all"
                                                maxLength={500}
                                            />
                                            <span className="text-xs text-neutral-400">{text.length}/500</span>
                                        </div>

                                        {/* Role (Optional) */}
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                                Your Role <span className="text-neutral-400 text-xs">(optional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                                placeholder="e.g. Designer, Student, Creator"
                                                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                                                maxLength={50}
                                            />
                                        </div>

                                        {/* Video URL (Optional) */}
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                                Video URL <span className="text-neutral-400 text-xs">(optional — earns 40 credits!)</span>
                                            </label>
                                            <input
                                                type="url"
                                                value={videoUrl}
                                                onChange={(e) => setVideoUrl(e.target.value)}
                                                placeholder="https://youtube.com/watch?v=..."
                                                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm text-neutral-800 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                                            />
                                            {videoUrl && (
                                                <p className="text-xs text-amber-500 mt-1">
                                                    ⚠️ Video reviews require admin approval before credits are awarded
                                                </p>
                                            )}
                                        </div>

                                        {/* Submit */}
                                        <motion.button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-pink-500 to-violet-600 text-white font-semibold text-sm hover:from-pink-600 hover:to-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <motion.span
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                        className="inline-block"
                                                    >
                                                        ⏳
                                                    </motion.span>
                                                    Submitting...
                                                </span>
                                            ) : (
                                                "Submit Review"
                                            )}
                                        </motion.button>
                                    </form>
                                </>
                            )}
                        </div>

                        {/* Panda Easter Egg 🐼 */}
                        <PandaEasterEgg />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ─── Video Card ─────────────────────────────────────
function VideoReviewCard({ review }: { review: Review }) {
    const [isPlaying, setIsPlaying] = useState(false);

    // Extract YouTube thumbnail if possible
    const getYouTubeThumbnail = (url: string) => {
        const match = url.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
        );
        return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
    };

    const getYouTubeEmbedUrl = (url: string) => {
        const match = url.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
        );
        return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : null;
    };

    const thumbnail = review.videoUrl ? getYouTubeThumbnail(review.videoUrl) : null;
    const embedUrl = review.videoUrl ? getYouTubeEmbedUrl(review.videoUrl) : null;

    return (
        <motion.div
            className="group relative rounded-xl overflow-hidden bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700/50 shadow-sm hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -4 }}
        >
            {/* Video Area */}
            <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                {isPlaying && embedUrl ? (
                    <iframe
                        src={embedUrl}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : (
                    <>
                        {thumbnail ? (
                            <Image
                                src={thumbnail}
                                alt={`${review.user?.name || "User"}'s testimonial`}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-500/20 to-violet-500/20">
                                <span className="text-4xl">🎬</span>
                            </div>
                        )}
                        {/* Play Button */}
                        <button
                            onClick={() => setIsPlaying(true)}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <motion.div
                                className="w-14 h-14 rounded-full bg-white/90 dark:bg-black/70 flex items-center justify-center shadow-lg backdrop-blur-sm"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="w-0 h-0 border-l-[18px] border-l-pink-500 border-y-[11px] border-y-transparent ml-1" />
                            </motion.div>
                        </button>
                        {/* Gradient overlay */}
                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
                    </>
                )}
            </div>

            {/* Info */}
            <div className="p-4">
                <div className="flex items-center gap-3">
                    {review.user?.image ? (
                        <Image
                            src={review.user.image}
                            alt={review.user.name || "User"}
                            width={32}
                            height={32}
                            className="rounded-full"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-xs text-white font-bold">
                            {(review.user?.name || "U")[0]}
                        </div>
                    )}
                    <div>
                        <p className="font-semibold text-sm text-neutral-800 dark:text-white">
                            {review.user?.name || "Anonymous"}
                        </p>
                        {review.role && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {review.role}
                            </p>
                        )}
                    </div>
                </div>
                {review.text && (
                    <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                        {review.text}
                    </p>
                )}
            </div>
        </motion.div>
    );
}

// ─── Text Card ──────────────────────────────────────
function TextReviewCard({ review }: { review: Review }) {
    const [expanded, setExpanded] = useState(false);
    const isLong = (review.text?.length || 0) > 150;

    return (
        <motion.div
            className="rounded-xl bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-700/50 p-5 shadow-sm hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -4 }}
        >
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
                {review.user?.image ? (
                    <Image
                        src={review.user.image}
                        alt={review.user.name || "User"}
                        width={40}
                        height={40}
                        className="rounded-full ring-2 ring-pink-200 dark:ring-pink-500/30"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex items-center justify-center text-sm text-white font-bold ring-2 ring-pink-200 dark:ring-pink-500/30">
                        {(review.user?.name || "U")[0]}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-neutral-800 dark:text-white">
                        {review.user?.name || "Anonymous"}
                    </p>
                    {review.role && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {review.role}
                        </p>
                    )}
                </div>
            </div>

            {/* Stars */}
            <StarRating rating={review.rating} size="sm" />

            {/* Text */}
            <div className="mt-3">
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {expanded || !isLong
                        ? review.text
                        : `${review.text?.slice(0, 150)}...`}
                </p>
                {isLong && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="mt-1 text-xs font-semibold text-pink-500 hover:text-pink-600 dark:text-pink-400 transition-colors"
                    >
                        {expanded ? "Show Less" : "Read More"}
                    </button>
                )}
            </div>

            {/* Date */}
            <div className="mt-3 flex items-center justify-end">
                <span className="text-[10px] text-neutral-400">
                    {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                    })}
                </span>
            </div>
        </motion.div>
    );
}

// ─── Sample Reviews (shown when few real reviews exist) ──
const SAMPLE_REVIEWS: Review[] = [
    {
        id: -9,
        userId: "sample",
        text: "Made a quick video reviewing OmniTemplates because I was genuinely blown away by how cinematic the Valentine's template looked! My girlfriend thought I hired a professional web designer 😂",
        rating: 5,
        role: "YouTuber",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        status: "approved",
        createdAt: "2026-02-12T12:00:00Z",
        user: { name: "Siddharth Joshi", image: "https://ui-avatars.com/api/?name=Siddharth+Joshi&background=8E44AD&color=fff&size=128&bold=true&font-size=0.4" },
    },
    {
        id: -1,
        userId: "sample",
        text: "Made the most beautiful Valentine's page for my girlfriend in just 5 minutes! She absolutely loved it. The animations and music made it so special. Will definitely use OmniTemplates for her birthday too! 💕",
        rating: 5,
        role: "Software Engineer",
        videoUrl: null,
        status: "approved",
        createdAt: "2026-02-10T10:30:00Z",
        user: { name: "Aarav Mehta", image: "https://ui-avatars.com/api/?name=Aarav+Mehta&background=FF6B6B&color=fff&size=128&bold=true&font-size=0.4" },
    },
    {
        id: -2,
        userId: "sample",
        text: "I was looking for something unique to surprise my wife on our anniversary. This platform exceeded all my expectations! The templates are gorgeous and customization was so easy. Totally worth it! 🥰",
        rating: 5,
        role: "Marketing Manager",
        videoUrl: null,
        status: "approved",
        createdAt: "2026-02-08T15:20:00Z",
        user: { name: "Priya Sharma", image: "https://ui-avatars.com/api/?name=Priya+Sharma&background=9B59B6&color=fff&size=128&bold=true&font-size=0.4" },
    },
    {
        id: -3,
        userId: "sample",
        text: "As a non-technical person, I was worried I wouldn't be able to create a nice website. But OmniTemplates made it incredibly simple. The experience is fantastic! My students were impressed too 😊",
        rating: 4,
        role: "Teacher",
        videoUrl: null,
        status: "approved",
        createdAt: "2026-02-06T09:45:00Z",
        user: { name: "Neha Gupta", image: "https://ui-avatars.com/api/?name=Neha+Gupta&background=3498DB&color=fff&size=128&bold=true&font-size=0.4" },
    },
    {
        id: -4,
        userId: "sample",
        text: "Used the birthday template for my best friend's surprise party invite. Everyone asked me how I made such a professional-looking page! The confetti animation was the cherry on top 🎂",
        rating: 5,
        role: "Graphic Designer",
        videoUrl: null,
        status: "approved",
        createdAt: "2026-02-04T14:10:00Z",
        user: { name: "Rohan Desai", image: "https://ui-avatars.com/api/?name=Rohan+Desai&background=E67E22&color=fff&size=128&bold=true&font-size=0.4" },
    },
    {
        id: -5,
        userId: "sample",
        text: "The proposal template helped me create the most memorable moment of our lives! My fiancée said yes and she keeps showing the page to everyone. Thank you OmniTemplates! 💍✨",
        rating: 5,
        role: "Business Analyst",
        videoUrl: null,
        status: "approved",
        createdAt: "2026-02-01T18:30:00Z",
        user: { name: "Ananya Iyer", image: "https://ui-avatars.com/api/?name=Ananya+Iyer&background=1ABC9C&color=fff&size=128&bold=true&font-size=0.4" },
    },
    {
        id: -6,
        userId: "sample",
        text: "Great concept and beautiful templates. I wish there were more free options, but the premium ones are definitely worth the price. The credit system for reviews is a nice touch 👏",
        rating: 4,
        role: "College Student",
        videoUrl: null,
        status: "approved",
        createdAt: "2026-01-28T11:15:00Z",
        user: { name: "Vikram Patel", image: "https://ui-avatars.com/api/?name=Vikram+Patel&background=2ECC71&color=fff&size=128&bold=true&font-size=0.4" },
    },
    {
        id: -7,
        userId: "sample",
        text: "I've tried several website builders for personal pages and OmniTemplates is by far the best for occasions like birthdays and anniversaries. The music integration and interactive animations are everything! 🎵",
        rating: 5,
        role: "Content Creator",
        videoUrl: null,
        status: "approved",
        createdAt: "2026-01-25T20:00:00Z",
        user: { name: "Kavya Reddy", image: "https://ui-avatars.com/api/?name=Kavya+Reddy&background=E91E63&color=fff&size=128&bold=true&font-size=0.4" },
    },
    {
        id: -8,
        userId: "sample",
        text: "Shared my Valentine's page on Instagram and got so many DMs asking how I made it! Simple, beautiful, and affordable. My wife cried happy tears when she saw it. 10/10 recommend! 🙌",
        rating: 5,
        role: "Freelance Developer",
        videoUrl: null,
        status: "approved",
        createdAt: "2026-01-22T16:40:00Z",
        user: { name: "Arjun Nair", image: "https://ui-avatars.com/api/?name=Arjun+Nair&background=F39C12&color=fff&size=128&bold=true&font-size=0.4" },
    },
];

// ─── Constants ──────────────────────────────────────
const ITEMS_PER_PAGE = 6;

// ─── Main Testimonials Section ─────────────────────
export default function Testimonials() {
    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState<TabId>("all");
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [slideDirection, setSlideDirection] = useState(1);

    const fetchReviews = useCallback(async () => {
        try {
            const res = await fetch("/api/reviews");
            if (res.ok) {
                const data = await res.json();
                const dbReviews: Review[] = data.reviews || [];
                // Always include all samples after DB reviews
                const sampleCount = Math.max(0, 9 - dbReviews.length);
                setReviews([...dbReviews, ...SAMPLE_REVIEWS.slice(0, sampleCount)]);
            } else {
                setReviews(SAMPLE_REVIEWS);
            }
        } catch (e) {
            console.error("Failed to fetch reviews:", e);
            setReviews(SAMPLE_REVIEWS);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const filteredReviews = reviews.filter((r) => {
        if (activeTab === "all") return true;
        if (activeTab === "video") return !!r.videoUrl;
        if (activeTab === "text") return !r.videoUrl;
        return true;
    });

    const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
    const paginatedReviews = filteredReviews.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE
    );

    // Reset page when tab changes
    useEffect(() => {
        setCurrentPage(0);
    }, [activeTab]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            setSlideDirection(newPage > currentPage ? 1 : -1);
            setCurrentPage(newPage);
        }
    };

    return (
        <section
            id="reviews"
            className="py-20 px-4 md:px-8 relative overflow-hidden"
        >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-50/50 via-white to-neutral-50/50 dark:from-neutral-950 dark:via-neutral-900/50 dark:to-neutral-950" />
            <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200/20 dark:bg-pink-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-violet-200/20 dark:bg-violet-500/5 rounded-full blur-3xl" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 mb-4">
                        What People Say
                    </h2>
                    <p className="text-neutral-500 dark:text-neutral-400 text-lg max-w-2xl mx-auto">
                        Real stories from real people who created unforgettable moments.
                    </p>
                </motion.div>

                {/* Tabs + Add Review Button */}
                <motion.div
                    className="flex flex-wrap items-center justify-center gap-3 mb-12"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${activeTab === tab.id
                                ? "bg-gradient-to-r from-pink-500 to-violet-600 text-white border-transparent shadow-lg shadow-pink-500/20"
                                : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-200 hover:bg-pink-50 dark:hover:bg-pink-500/10 hover:border-pink-300 dark:hover:border-pink-500/30"
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}

                    {/* Add Review / Sign Up CTA */}
                    {status === "authenticated" ? (
                        <motion.button
                            onClick={() => setIsFormOpen(true)}
                            className="px-5 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white border border-transparent shadow-lg shadow-amber-500/20 hover:from-amber-500 hover:to-orange-600 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            ✏️ Add Your Review
                        </motion.button>
                    ) : status !== "loading" ? (
                        <motion.button
                            onClick={() => signIn("google")}
                            className="px-5 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r from-emerald-400 to-teal-500 text-white border border-transparent shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-600 transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            🎁 Free 25 credits after signup — Write a review!
                        </motion.button>
                    ) : null}
                </motion.div>

                {/* Reviews — Paginated Masonry Layout */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <motion.div
                            className="text-3xl"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                            ⏳
                        </motion.div>
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <motion.div
                        className="text-center py-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="text-5xl mb-4">💭</div>
                        <p className="text-neutral-500 dark:text-neutral-400 text-lg">
                            No reviews yet. Be the first to share your experience!
                        </p>
                    </motion.div>
                ) : (
                    <div>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${activeTab}-${currentPage}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                {/* Masonry columns layout */}
                                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                                    {paginatedReviews.map((review, i) => (
                                        <motion.div
                                            key={review.id}
                                            className="break-inside-avoid"
                                            initial={{
                                                opacity: 0,
                                                x: i % 2 === 0
                                                    ? slideDirection * -80
                                                    : slideDirection * 80,
                                            }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{
                                                delay: i * 0.08,
                                                duration: 0.45,
                                                ease: [0.25, 0.46, 0.45, 0.94],
                                            }}
                                        >
                                            {review.videoUrl ? (
                                                <VideoReviewCard review={review} />
                                            ) : (
                                                <TextReviewCard review={review} />
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-10">
                                {/* Previous */}
                                <motion.button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 0}
                                    className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/60 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-pink-50 dark:hover:bg-pink-500/10 hover:border-pink-300 dark:hover:border-pink-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    whileHover={currentPage > 0 ? { scale: 1.1 } : {}}
                                    whileTap={currentPage > 0 ? { scale: 0.9 } : {}}
                                >
                                    ←
                                </motion.button>

                                {/* Dot indicators */}
                                <div className="flex items-center gap-2">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handlePageChange(i)}
                                            className={`rounded-full transition-all duration-300 ${i === currentPage
                                                ? "w-8 h-3 bg-gradient-to-r from-pink-500 to-violet-500"
                                                : "w-3 h-3 bg-neutral-300 dark:bg-neutral-600 hover:bg-pink-300 dark:hover:bg-pink-500/50"
                                                }`}
                                        />
                                    ))}
                                </div>

                                {/* Next */}
                                <motion.button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages - 1}
                                    className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/60 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-pink-50 dark:hover:bg-pink-500/10 hover:border-pink-300 dark:hover:border-pink-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    whileHover={currentPage < totalPages - 1 ? { scale: 1.1 } : {}}
                                    whileTap={currentPage < totalPages - 1 ? { scale: 0.9 } : {}}
                                >
                                    →
                                </motion.button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Review Form Overlay */}
            <ReviewFormOverlay
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={fetchReviews}
            />
        </section>
    );
}
