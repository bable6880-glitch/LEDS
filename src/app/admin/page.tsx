"use client";

import { useAuth } from "@/lib/firebase/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
type Report = { id: string; reason: string; status: string; reportType: string; createdAt: string };
type PlatformStats = { totalUsers: number; totalKitchens: number; totalOrders: number; totalReviews: number; pendingReports: number };

export default function AdminPage() {
    const { user, loading: authLoading, getIdToken } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [activeTab, setActiveTab] = useState<"stats" | "reports">("stats");
    const [loading, setLoading] = useState(true);

    const loadAdmin = useCallback(async () => {
        try {
            const token = await getIdToken();
            if (!token) return;
            const headers = { Authorization: `Bearer ${token}` };

            const [statsRes, reportsRes] = await Promise.all([
                fetch("/api/admin?action=stats", { headers }),
                fetch("/api/admin?status=PENDING", { headers }),
            ]);

            if (statsRes.ok) { const d = await statsRes.json(); setStats(d.data); }
            if (reportsRes.ok) { const d = await reportsRes.json(); setReports(d.data || []); }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [getIdToken]);

    useEffect(() => {
        if (!authLoading && (!user || user.role !== "ADMIN")) {
            router.push("/");
            return;
        }
        if (user) loadAdmin();
    }, [user, authLoading, router, loadAdmin]);

    const resolveReport = async (reportId: string, status: "RESOLVED" | "DISMISSED") => {
        const token = await getIdToken();
        await fetch("/api/admin", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ action: "resolve_report", reportId, resolution: `${status} by admin`, status }),
        });
        setReports((prev) => prev.filter((r) => r.id !== reportId));
    };

    if (authLoading || loading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="space-y-4">{[1, 2, 3, 4].map((i) => <div key={i} className="h-24 rounded-2xl animate-shimmer" />)}</div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-8 dark:text-neutral-50">Admin Dashboard</h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-8">
                {(["stats", "reports"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${activeTab === tab
                            ? "bg-primary-500 text-white shadow-sm"
                            : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300"
                            }`}
                    >
                        {tab === "stats" ? "📊 Platform Stats" : `🚨 Reports (${reports.length})`}
                    </button>
                ))}
            </div>

            {/* Stats Tab */}
            {activeTab === "stats" && stats && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 animate-fade-in">
                    <StatCard icon="👥" label="Total Users" value={stats.totalUsers} />
                    <StatCard icon="🏠" label="Kitchens" value={stats.totalKitchens} />
                    <StatCard icon="📦" label="Orders" value={stats.totalOrders} />
                    <StatCard icon="⭐" label="Reviews" value={stats.totalReviews} />
                    <StatCard icon="🚨" label="Pending Reports" value={stats.pendingReports} accent />
                </div>
            )}

            {/* Reports Tab */}
            {activeTab === "reports" && (
                <div className="space-y-3 animate-fade-in">
                    {reports.length === 0 ? (
                        <div className="text-center py-12 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-600">
                            <span className="text-4xl block mb-3">✅</span>
                            <h3 className="font-semibold text-neutral-700 dark:text-neutral-300">All clear!</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">No pending reports to review</p>
                        </div>
                    ) : (
                        reports.map((report) => (
                            <div key={report.id} className="rounded-xl border border-neutral-200/60 bg-white p-5 shadow-sm dark:bg-neutral-800 dark:border-neutral-700">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-300">{report.reportType}</span>
                                        <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">{report.reason}</p>
                                        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => resolveReport(report.id, "RESOLVED")} className="rounded-lg bg-accent-50 px-3 py-1.5 text-xs font-medium text-accent-700 hover:bg-accent-100 transition-all dark:bg-accent-900/30 dark:text-accent-300">
                                            Resolve
                                        </button>
                                        <button onClick={() => resolveReport(report.id, "DISMISSED")} className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-200 transition-all dark:bg-neutral-700 dark:text-neutral-300">
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value, accent }: { icon: string; label: string; value: number; accent?: boolean }) {
    return (
        <div className={`rounded-2xl border p-5 shadow-sm ${accent ? "border-red-200/60 bg-red-50 dark:border-red-800 dark:bg-red-900/20" : "border-neutral-200/60 bg-white dark:bg-neutral-800 dark:border-neutral-700"}`}>
            <span className="text-2xl">{icon}</span>
            <p className={`text-2xl font-bold mt-2 ${accent ? "text-red-600 dark:text-red-400" : "text-neutral-900 dark:text-neutral-50"}`}>{value.toLocaleString()}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
        </div>
    );
}
