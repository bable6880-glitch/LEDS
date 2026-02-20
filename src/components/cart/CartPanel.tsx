"use client";

import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/firebase/auth-context";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CartPanel() {
    const { items, total, itemCount, kitchenName, kitchenId, updateQuantity, removeItem, clearCart } = useCart();
    const { user, loading: authLoading, getIdToken } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [deliveryMode, setDeliveryMode] = useState<"SELF_PICKUP" | "FREE_DELIVERY">("SELF_PICKUP");

    const proceedToCheckout = async () => {
        if (itemCount === 0) return;

        if (!user && !authLoading) {
            const confirmLogin = window.confirm("You need to login to place an order. Proceed to login?");
            if (confirmLogin) {
                router.push(`/login?redirect=/kitchen/${kitchenId}`);
            }
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Get auth token for the API call
            const token = await getIdToken();
            if (!token) {
                setError("Authentication failed. Please log in again.");
                setIsSubmitting(false);
                return;
            }

            // Get location if delivery mode is FREE_DELIVERY
            let lat: number | undefined, lng: number | undefined;
            if (deliveryMode === "FREE_DELIVERY") {
                try {
                    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                    });
                    lat = pos.coords.latitude;
                    lng = pos.coords.longitude;
                } catch {
                    // Location not available — continue without it
                }
            }

            const res = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    kitchenId,
                    items: items.map(i => ({
                        mealId: i.mealId,
                        quantity: i.quantity,
                    })),
                    deliveryMode,
                    notes: "",
                    customerLat: lat,
                    customerLng: lng,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error?.message || "Failed to place order");
            }

            const { data: order } = await res.json();

            // Success — clear cart & go to order details
            clearCart();
            alert("Order placed successfully! 🚀");
            router.push(`/orders/${order.id}`);

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (itemCount === 0) {
        return null;
    }

    return (
        <>
            {/* Mobile Toggle Button (Sticky Bottom) */}
            <div className="fixed bottom-4 right-4 z-40 md:hidden">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-white shadow-lg shadow-primary-500/30 transition-transform active:scale-95"
                >
                    <span className="font-bold">{itemCount} items</span>
                    <span>&bull;</span>
                    <span className="font-bold">Rs. {total}</span>
                </button>
            </div>

            {/* Cart Sidebar */}
            <div
                className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 dark:bg-neutral-900 md:translate-x-0 ${isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
                    } md:sticky md:top-24 md:h-[calc(100vh-8rem)] md:rounded-2xl md:border md:border-neutral-200 md:shadow-none dark:border-neutral-800`}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
                        <div>
                            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Your Cart</h2>
                            <p className="text-xs text-neutral-500 line-clamp-1 dark:text-neutral-400">from {kitchenName}</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg md:hidden dark:text-neutral-400 dark:hover:bg-neutral-800"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Items List */}
                    <div className="flex-1 overflow-y-auto px-5 py-2">
                        {items.map((item) => (
                            <div key={item.mealId} className="flex gap-4 py-4 border-b border-neutral-100 last:border-0 dark:border-neutral-800">
                                {item.imageUrl ? (
                                    <div className="h-16 w-16 shrink-0 rounded-lg bg-neutral-100 overflow-hidden">
                                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="h-16 w-16 shrink-0 rounded-lg bg-neutral-100 flex items-center justify-center text-xl dark:bg-neutral-800">
                                        🍱
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-neutral-900 truncate dark:text-neutral-200">{item.name}</h3>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Rs. {item.price * item.quantity}</p>

                                    <div className="mt-2 flex items-center gap-3">
                                        <div className="flex items-center rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800">
                                            <button
                                                onClick={() => updateQuantity(item.mealId, item.quantity - 1)}
                                                className="px-2 py-1 text-sm font-medium hover:bg-neutral-200 transition-colors dark:hover:bg-neutral-700"
                                            >
                                                −
                                            </button>
                                            <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.mealId, item.quantity + 1)}
                                                className="px-2 py-1 text-sm font-medium hover:bg-neutral-200 transition-colors dark:hover:bg-neutral-700"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.mealId)}
                                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer / Checkout */}
                    <div className="border-t border-neutral-100 p-5 bg-neutral-50 dark:bg-neutral-900/50 dark:border-neutral-800/50">

                        <div className="mb-4 flex rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
                            <button
                                onClick={() => setDeliveryMode("SELF_PICKUP")}
                                className={`flex-1 rounded-md py-1.5 text-xs font-semibold max-w-[50%] transition-all ${deliveryMode === "SELF_PICKUP"
                                    ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
                                    }`}
                            >
                                🏃 Self Pickup
                            </button>
                            <button
                                onClick={() => setDeliveryMode("FREE_DELIVERY")}
                                className={`flex-1 rounded-md py-1.5 text-xs font-semibold max-w-[50%] transition-all ${deliveryMode === "FREE_DELIVERY"
                                    ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                                    : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
                                    }`}
                            >
                                🛵 Free Delivery
                            </button>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <span className="text-neutral-600 dark:text-neutral-400">Total</span>
                            <span className="text-xl font-bold text-neutral-900 dark:text-white">Rs. {total}</span>
                        </div>

                        {error && (
                            <div className="mb-3 rounded-lg bg-red-50 p-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-300">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={proceedToCheckout}
                            disabled={isSubmitting}
                            className="w-full rounded-xl bg-primary-600 py-3.5 text-sm font-bold text-white shadow-md shadow-primary-500/20 transition-all hover:bg-primary-700 hover:shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Placing Order..." : `Checkout • Rs. ${total}`}
                        </button>

                        <p className="mt-3 text-center text-xs text-neutral-400 dark:text-neutral-500">
                            Free delivery within 2km range
                        </p>
                    </div>
                </div>
            </div>

            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
