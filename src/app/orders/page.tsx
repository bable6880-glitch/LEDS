"use client";

import { useAuth } from "@/lib/firebase/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

type Order = {
    id: string;
    status: string;
    totalAmount: number;
    note: string | null;
    createdAt: string;
    kitchen?: { name: string };
};

export default function OrdersPage() {
    const { user, loading: authLoading, getIdToken } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = useCallback(async () => {
        try {
            const token = await getIdToken();
            if (!token) return;
            const res = await fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setOrders(data.data || []);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [getIdToken]);

    useEffect(() => {
        if (!authLoading && !user) { router.push("/login?redirect=/orders"); return; }
        if (user) loadOrders();
    }, [user, authLoading, router, loadOrders]);

    const statusColor = (s: string) => {
        switch (s) {
            case "DELIVERED": return "bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300";
            case "CONFIRMED": return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
            case "PREPARING": return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
            case "CANCELLED": return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300";
            default: return "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300";
        }
    };

    if (authLoading || loading) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-8">
                <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl animate-shimmer" />)}</div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-neutral-900 mb-6 dark:text-neutral-50">My Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-600">
                    <span className="text-4xl block mb-3">📦</span>
                    <h3 className="font-semibold text-neutral-700 dark:text-neutral-300">No orders yet</h3>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Browse kitchens and place your first order</p>
                    <a href="/explore" className="mt-4 inline-block rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 transition-all">
                        Explore Kitchens
                    </a>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => (
                        <div key={order.id} className="rounded-xl border border-neutral-200/60 bg-white p-5 shadow-sm dark:bg-neutral-800 dark:border-neutral-700">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                                        Order #{order.id.slice(0, 8)}
                                    </p>
                                    {order.kitchen && (
                                        <p className="text-sm text-neutral-500 mt-0.5 dark:text-neutral-400">
                                            from {order.kitchen.name}
                                        </p>
                                    )}
                                    <p className="text-lg font-bold text-primary-600 mt-2 dark:text-primary-400">
                                        Rs. {Number(order.totalAmount).toLocaleString()}
                                    </p>
                                    {order.note && (
                                        <p className="text-sm text-neutral-500 mt-1 dark:text-neutral-400">Note: {order.note}</p>
                                    )}
                                    <p className="text-xs text-neutral-400 mt-2 dark:text-neutral-500">
                                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                                            day: "numeric", month: "short", year: "numeric",
                                        })}
                                    </p>
                                </div>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
