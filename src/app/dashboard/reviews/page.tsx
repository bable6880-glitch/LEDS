"use client";

import { useAuth } from "@/lib/firebase/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const RATING_LABELS: Record<number, { label: string; emoji: string; color: string }> = {
    1: { label: "Worst", emoji: "😡", color: "bg-red-500" },
    2: { label: "Medium", emoji: "😐", color: "bg-orange-400" },
    3: { label: "Good", emoji: "🙂", color: "bg-yellow-400" },
    4: { label: "Excellent", emoji: "😊", color: "bg-green-400" },
    5: { label: "Super", emoji: "🤩", color: "bg-emerald-500" },
};

type Review = {
    id: string;
    rating: number;
    comment: string | null;
    userName: string | null;
    userAvatar: string | null;
    menuItemName: string | null;
    isVerifiedPurchase: boolean;
    createdAt: string;
};

export default function ReviewsDashboardPage() {
    const { user, loading: authLoading, getIdToken } = useAuth();
    const router = useRouter();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [kitchenId, setKitchenId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const loadReviews = useCallback(async () => {
        try {
            const token = await getIdToken();
            if (!token) return;

            // First get the kitchen
            const kitchenRes = await fetch("/api/kitchens?ownerId=me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!kitchenRes.ok) return;
            const kitchenData = await kitchenRes.json();
            const kitchens = kitchenData.data || [];
            if (kitchens.length === 0) return;
            const kId = kitchens[0].id;
            setKitchenId(kId);

            // Then fetch reviews
            const res = await fetch(`/api/kitchens/${kId}/reviews`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setReviews(data.data || []);
            }
        } catch (err) {
            console.error("Load reviews error:", err);
        } finally {
            setLoading(false);
        }
    }, [getIdToken]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/seller/login");
            return;
        }
        if (user) loadReviews();
    }, [user, authLoading, router, loadReviews]);

    // Calculate rating distribution
    const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
        rating: r,
        count: reviews.filter((rev) => rev.rating === r).length,
        ...RATING_LABELS[r],
    }));
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / totalReviews).toFixed(1) : "0.0";

    if (authLoading || loading) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 w-48 rounded-lg animate-shimmer" />
                    <div className="h-48 rounded-2xl animate-shimmer" />
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Reviews &amp; Ratings</h1>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        See what customers think about your food
                    </p>
                </div>
                <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400">
                    ← Dashboard
                </Link>
            </div>

            {/* ── Rating Summary ── */}
            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm mb-8 dark:bg-neutral-800 dark:border-neutral-700">
                <div className="flex flex-col sm:flex-row gap-8">
                    {/* Score */}
                    <div className="text-center sm:text-left">
                        <p className="text-5xl font-extrabold text-neutral-900 dark:text-neutral-50">{avgRating}</p>
                        <div className="flex items-center justify-center sm:justify-start gap-1 mt-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <span key={s} className={`text-lg ${Number(avgRating) >= s ? "text-amber-400" : "text-neutral-300 dark:text-neutral-600"}`}>
                                    ★
                                </span>
                            ))}
                        </div>
                        <p className="text-sm text-neutral-500 mt-1 dark:text-neutral-400">{totalReviews} reviews</p>
                    </div>

                    {/* Distribution Bars */}
                    <div className="flex-1 space-y-2">
                        {ratingDist.map((d) => (
                            <div key={d.rating} className="flex items-center gap-3">
                                <span className="text-sm w-20 text-right font-medium text-neutral-600 dark:text-neutral-300">
                                    {d.emoji} {d.label}
                                </span>
                                <div className="flex-1 h-5 rounded-full bg-neutral-100 dark:bg-neutral-700 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${d.color} transition-all duration-500`}
                                        style={{ width: totalReviews > 0 ? `${(d.count / totalReviews) * 100}%` : "0%" }}
                                    />
                                </div>
                                <span className="text-sm w-8 text-neutral-500 dark:text-neutral-400">{d.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Reviews List ── */}
            {reviews.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-600">
                    <span className="text-4xl block mb-3">💬</span>
                    <h3 className="font-semibold text-neutral-700 dark:text-neutral-300">No reviews yet</h3>
                    <p className="text-sm text-neutral-500 mt-1 dark:text-neutral-400">
                        Reviews will appear here once customers rate your food
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="rounded-2xl border border-neutral-200/60 bg-white p-5 shadow-sm dark:bg-neutral-800 dark:border-neutral-700"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    {review.userAvatar ? (
                                        <img src={review.userAvatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                                            {review.userName?.[0]?.toUpperCase() || "?"}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                                            {review.userName || "Anonymous"}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs">
                                                {RATING_LABELS[review.rating]?.emoji} {RATING_LABELS[review.rating]?.label}
                                            </span>
                                            {review.isVerifiedPurchase && (
                                                <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium dark:bg-green-900/20 dark:text-green-400">
                                                    ✓ Verified
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <span key={s} className={`text-sm ${review.rating >= s ? "text-amber-400" : "text-neutral-300 dark:text-neutral-600"}`}>★</span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-neutral-400 mt-1">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            {review.menuItemName && (
                                <p className="mt-2 text-xs text-primary-600 dark:text-primary-400 font-medium">
                                    🍱 {review.menuItemName}
                                </p>
                            )}
                            {review.comment && (
                                <p className="mt-3 text-sm text-neutral-700 leading-relaxed dark:text-neutral-300">
                                    {review.comment}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {kitchenId && null /* Prevents unused warning */}
        </div>
    );
}
