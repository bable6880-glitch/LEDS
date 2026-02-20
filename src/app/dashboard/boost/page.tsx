"use client";

import { useAuth } from "@/lib/firebase/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { SUBSCRIPTION_PLANS } from "@/lib/validations/subscription";

type PlanKey = keyof typeof SUBSCRIPTION_PLANS;

const PAYMENT_METHODS = [
    { id: "STRIPE" as const, label: "Credit/Debit Card", icon: "💳", available: true },
    { id: "JAZZCASH" as const, label: "JazzCash", icon: "📱", available: false },
    { id: "EASYPAISA" as const, label: "EasyPaisa", icon: "📲", available: false },
    { id: "SADAPAY" as const, label: "SadaPay", icon: "🏦", available: false },
    { id: "BANK_TRANSFER" as const, label: "Bank Transfer", icon: "🏛️", available: false },
];

export default function BoostPage() {
    const { user, loading: authLoading, getIdToken } = useAuth();
    const router = useRouter();
    const [kitchenId, setKitchenId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState<PlanKey>("BASE_MONTHLY");
    const [selectedPayment, setSelectedPayment] = useState("STRIPE");
    const [purchasing, setPurchasing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            const token = await getIdToken();
            if (!token) return;
            const kRes = await fetch("/api/kitchens?ownerId=me", { headers: { Authorization: `Bearer ${token}` } });
            if (kRes.ok) {
                const d = await kRes.json();
                const k = (d.data || [])[0];
                if (k) setKitchenId(k.id);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [getIdToken]);

    useEffect(() => {
        if (!authLoading && !user) { router.push("/login?redirect=/dashboard/boost"); return; }
        if (user) load();
    }, [user, authLoading, router, load]);

    const handleCheckout = async () => {
        if (!kitchenId) return;
        setPurchasing(true);
        setError(null);
        try {
            const token = await getIdToken();
            const res = await fetch("/api/seller/subscription/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    kitchenId,
                    planType: selectedPlan,
                    paymentMethod: selectedPayment,
                }),
            });

            const data = await res.json();

            if (data.success && data.data?.url) {
                window.location.href = data.data.url;
            } else if (data.data?.status === "COMING_SOON") {
                setError(data.data.message);
            } else {
                setError(data.error?.message || "Failed to create checkout session");
            }
        } catch { setError("Network error. Please try again."); }
        finally { setPurchasing(false); }
    };

    if (authLoading || loading) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-8">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    {[1, 2, 3].map((i) => <div key={i} className="h-64 rounded-2xl animate-shimmer" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
                <a href="/dashboard" className="text-sm text-neutral-500 hover:text-primary-600 dark:text-neutral-400">← Dashboard</a>
                <h1 className="text-3xl font-bold text-neutral-900 mt-2 dark:text-neutral-50">⚡ Boost Your Kitchen</h1>
                <p className="mt-2 text-neutral-500 dark:text-neutral-400">Get more visibility and attract more customers</p>
            </div>

            {/* Success / Error Banners */}
            {successMessage && (
                <div className="mb-6 rounded-xl bg-accent-50 border border-accent-200 px-4 py-3 text-sm text-accent-800 animate-slide-up dark:bg-accent-900/30 dark:border-accent-800 dark:text-accent-300">
                    {successMessage}
                    <button onClick={() => setSuccessMessage(null)} className="ml-2 text-accent-600 hover:text-accent-800 font-medium">✕</button>
                </div>
            )}
            {error && (
                <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 animate-slide-up dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
                    {error}
                    <button onClick={() => setError(null)} className="ml-2 text-red-600 hover:text-red-800 font-medium">✕</button>
                </div>
            )}

            {/* Plan Selection */}
            <section className="mb-8">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
                    Choose Your Plan
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {(Object.entries(SUBSCRIPTION_PLANS) as [PlanKey, (typeof SUBSCRIPTION_PLANS)[PlanKey]][]).map(([key, plan]) => {
                        const isSelected = selectedPlan === key;
                        const isRecommended = key === "BASE_2MONTH";

                        return (
                            <button
                                key={key}
                                onClick={() => setSelectedPlan(key)}
                                className={`relative rounded-2xl border-2 p-5 text-left transition-all ${isSelected
                                        ? "border-primary-500 bg-primary-50/50 shadow-md dark:bg-primary-900/20"
                                        : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm dark:bg-neutral-800 dark:border-neutral-700 dark:hover:border-neutral-600"
                                    }`}
                            >
                                {isRecommended && (
                                    <span className="absolute -top-2.5 left-4 rounded-full bg-primary-500 px-3 py-0.5 text-xs font-bold text-white shadow-sm">
                                        RECOMMENDED
                                    </span>
                                )}
                                <div className="mb-3">
                                    <h3 className="font-bold text-neutral-900 dark:text-neutral-50">{plan.label}</h3>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{plan.description}</p>
                                </div>
                                <div className="mb-2">
                                    <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{plan.displayPrice}</span>
                                </div>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">{plan.perMonthDisplay}</p>
                                {isSelected && (
                                    <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white text-xs">✓</div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Payment Method */}
            <section className="mb-8">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-50 mb-4">
                    Payment Method
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {PAYMENT_METHODS.map((method) => (
                        <button
                            key={method.id}
                            onClick={() => { if (method.available) setSelectedPayment(method.id); }}
                            disabled={!method.available}
                            className={`relative rounded-xl border-2 p-4 text-left transition-all ${selectedPayment === method.id
                                    ? "border-primary-500 bg-primary-50/50 dark:bg-primary-900/20"
                                    : method.available
                                        ? "border-neutral-200 bg-white hover:border-neutral-300 dark:bg-neutral-800 dark:border-neutral-700"
                                        : "border-neutral-100 bg-neutral-50 opacity-60 cursor-not-allowed dark:bg-neutral-900 dark:border-neutral-800"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">{method.icon}</span>
                                <div>
                                    <p className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">{method.label}</p>
                                    {!method.available && <p className="text-xs text-neutral-400">Coming Soon</p>}
                                </div>
                            </div>
                            {selectedPayment === method.id && (
                                <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white text-xs">✓</div>
                            )}
                        </button>
                    ))}
                </div>
            </section>

            {/* Features Included */}
            <section className="mb-8">
                <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 dark:bg-neutral-800 dark:border-neutral-700">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-50 mb-3">What&apos;s Included</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        {[
                            "⚡ Priority listing boost",
                            "✅ Verified badge",
                            "📊 Advanced analytics",
                            "🔔 Order notifications",
                            "📱 WhatsApp integration",
                            "🍽️ Full menu management",
                            "⭐ Customer reviews",
                            "🎯 Priority customer support",
                        ].map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Checkout Button */}
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    onClick={handleCheckout}
                    disabled={purchasing || !kitchenId}
                    className="flex-1 rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                >
                    {purchasing ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Processing…
                        </span>
                    ) : (
                        `Subscribe — ${SUBSCRIPTION_PLANS[selectedPlan].displayPrice}`
                    )}
                </button>
                <button
                    onClick={() => router.push("/dashboard")}
                    className="rounded-xl border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-all dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300"
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}
