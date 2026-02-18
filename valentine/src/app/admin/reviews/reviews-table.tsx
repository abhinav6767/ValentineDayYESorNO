"use client";

import { useState, useTransition } from "react";
import { approveReview, rejectReview } from "./actions";

interface ReviewRow {
    id: number;
    userId: string;
    text: string | null;
    rating: number;
    role: string | null;
    videoUrl: string | null;
    status: string;
    creditsAwarded: number;
    createdAt: string;
    user: {
        name: string | null;
        email: string | null;
        image: string | null;
    };
}

export default function ReviewsTable({ reviews }: { reviews: ReviewRow[] }) {
    const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
    const [isPending, startTransition] = useTransition();

    const filtered = reviews.filter((r) =>
        filter === "all" ? true : r.status === filter
    );

    const pendingCount = reviews.filter((r) => r.status === "pending").length;

    const handleApprove = (id: number) => {
        startTransition(async () => {
            try {
                await approveReview(id);
            } catch (e: any) {
                alert(e.message || "Failed to approve");
            }
        });
    };

    const handleReject = (id: number) => {
        if (!confirm("Reject this review? This cannot be undone.")) return;
        startTransition(async () => {
            try {
                await rejectReview(id);
            } catch (e: any) {
                alert(e.message || "Failed to reject");
            }
        });
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {(["all", "pending", "approved", "rejected"] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${filter === f
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-border hover:bg-muted"
                            }`}
                    >
                        {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                        {f === "pending" && pendingCount > 0 && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-xs">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium">User</th>
                                <th className="text-left px-4 py-3 font-medium">Review</th>
                                <th className="text-left px-4 py-3 font-medium">Rating</th>
                                <th className="text-left px-4 py-3 font-medium">Type</th>
                                <th className="text-left px-4 py-3 font-medium">Status</th>
                                <th className="text-left px-4 py-3 font-medium">Credits</th>
                                <th className="text-left px-4 py-3 font-medium">Date</th>
                                <th className="text-left px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                                        No reviews found
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((review) => (
                                    <tr key={review.id} className="border-t hover:bg-muted/30 transition-colors">
                                        {/* User */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {review.user.image ? (
                                                    <img
                                                        src={review.user.image}
                                                        alt=""
                                                        className="w-7 h-7 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                                                        {(review.user.name || "?")[0]}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium">{review.user.name || "Unknown"}</div>
                                                    <div className="text-xs text-muted-foreground">{review.user.email}</div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Review text */}
                                        <td className="px-4 py-3 max-w-[200px]">
                                            <p className="truncate">{review.text || "—"}</p>
                                            {review.role && (
                                                <span className="text-xs text-muted-foreground">Role: {review.role}</span>
                                            )}
                                        </td>

                                        {/* Rating */}
                                        <td className="px-4 py-3">
                                            {"⭐".repeat(review.rating)}
                                        </td>

                                        {/* Type */}
                                        <td className="px-4 py-3">
                                            {review.videoUrl ? (
                                                <a
                                                    href={review.videoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 hover:underline"
                                                >
                                                    🎬 Video
                                                </a>
                                            ) : (
                                                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                                                    💬 Text
                                                </span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3">
                                            <span
                                                className={`text-xs px-2 py-1 rounded-full font-medium ${review.status === "approved"
                                                        ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                                        : review.status === "pending"
                                                            ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"
                                                            : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300"
                                                    }`}
                                            >
                                                {review.status}
                                            </span>
                                        </td>

                                        {/* Credits */}
                                        <td className="px-4 py-3 font-medium">
                                            {review.creditsAwarded > 0 ? `🪙 ${review.creditsAwarded}` : "—"}
                                        </td>

                                        {/* Date */}
                                        <td className="px-4 py-3 text-muted-foreground text-xs">
                                            {new Date(review.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3">
                                            {review.status === "pending" && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApprove(review.id)}
                                                        disabled={isPending}
                                                        className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                                    >
                                                        ✅ Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(review.id)}
                                                        disabled={isPending}
                                                        className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                                                    >
                                                        ❌ Reject
                                                    </button>
                                                </div>
                                            )}
                                            {review.status !== "pending" && (
                                                <span className="text-xs text-muted-foreground">
                                                    {review.status === "approved" ? "Done" : "Rejected"}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
