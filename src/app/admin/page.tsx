"use client";

import { useAuth } from "@/lib/firebase/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

// CHANGED [H5]: Expanded admin dashboard with users, kitchens, and audit log tabs

type Report = { id: string; reason: string; status: string; reportType: string; createdAt: string };
type PlatformStats = { totalUsers: number; totalKitchens: number; totalOrders: number; totalReviews: number; pendingReports: number };
type UserRow = { id: string; name: string | null; email: string | null; role: string; isActive: boolean; createdAt: string; avatarUrl: string | null };
type KitchenRow = { id: string; name: string; city: string; status: string; isVerified: boolean; avgRating: string; reviewCount: number; createdAt: string; owner: { id: string; name: string | null; email: string | null } };
type AuditRow = { id: string; action: string; targetType: string; targetId: string; details: string | null; createdAt: string; admin: { id: string; name: string | null } };

type TabKey = "stats" | "reports" | "users" | "kitchens" | "audit";

export default function AdminPage() {
    const { user, loading: authLoading, getIdToken } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [users, setUsers] = useState<UserRow[]>([]);
    const [kitchens, setKitchens] = useState<KitchenRow[]>([]);
    const [auditLog, setAuditLog] = useState<AuditRow[]>([]);
    const [activeTab, setActiveTab] = useState<TabKey>("stats");
    const [loading, setLoading] = useState(true);

    const loadAdmin = useCallback(async () => {
        try {
            const token = await getIdToken();
            if (!token) return;
            const headers = { Authorization: `Bearer ${token}` };

            const [statsRes, reportsRes, usersRes, kitchensRes, auditRes] = await Promise.all([
                fetch("/api/admin?action=stats", { headers }),
                fetch("/api/admin?status=PENDING", { headers }),
                fetch("/api/admin?action=users&limit=50", { headers }),
                fetch("/api/admin?action=kitchens&limit=50", { headers }),
                fetch("/api/admin?action=audit_log&limit=50", { headers }),
            ]);

            if (statsRes.ok) { const d = await statsRes.json(); setStats(d.data); }
            if (reportsRes.ok) { const d = await reportsRes.json(); setReports(d.data || []); }
            if (usersRes.ok) { const d = await usersRes.json(); setUsers(d.data || []); }
            if (kitchensRes.ok) { const d = await kitchensRes.json(); setKitchens(d.data || []); }
            if (auditRes.ok) { const d = await auditRes.json(); setAuditLog(d.data || []); }
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

    const adminAction = async (action: string, body: Record<string, unknown>) => {
        const token = await getIdToken();
        await fetch("/api/admin", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ action, ...body }),
        });
        loadAdmin(); // refresh
    };

    if (authLoading || loading) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="space-y-4">{[1, 2, 3, 4].map((i) => <div key={i} className="h-24 rounded-2xl bg-neutral-200 animate-pulse dark:bg-neutral-700" />)}</div>
            </div>
        );
    }

    const tabs: { key: TabKey; label: string; emoji: string; count?: number }[] = [
        { key: "stats", label: "Platform Stats", emoji: "📊" },
        { key: "reports", label: "Reports", emoji: "🚨", count: reports.length },
        { key: "users", label: "Users", emoji: "👥", count: users.length },
        { key: "kitchens", label: "Kitchens", emoji: "🏠", count: kitchens.length },
        { key: "audit", label: "Audit Log", emoji: "📋", count: auditLog.length },
    ];

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-8 dark:text-neutral-50">Admin Dashboard</h1>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${activeTab === tab.key
                            ? "bg-primary-500 text-white shadow-sm"
                            : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300"
                            }`}
                    >
                        {tab.emoji} {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ""}
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
                        <EmptyState emoji="✅" title="All clear!" subtitle="No pending reports to review" />
                    ) : (
                        reports.map((report) => (
                            <div key={report.id} className="rounded-xl border border-neutral-200/60 bg-white p-5 shadow-sm dark:bg-neutral-800 dark:border-neutral-700">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-300">{report.reportType}</span>
                                        <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">{report.reason}</p>
                                        <p className="mt-1 text-xs text-neutral-400">{new Date(report.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => adminAction("resolve_report", { reportId: report.id, resolution: "Resolved by admin", status: "RESOLVED" })} className="rounded-lg bg-accent-50 px-3 py-1.5 text-xs font-medium text-accent-700 hover:bg-accent-100 transition-all dark:bg-accent-900/30 dark:text-accent-300">Resolve</button>
                                        <button onClick={() => adminAction("resolve_report", { reportId: report.id, resolution: "Dismissed by admin", status: "DISMISSED" })} className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-200 transition-all dark:bg-neutral-700 dark:text-neutral-300">Dismiss</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
                <div className="animate-fade-in overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 dark:border-neutral-700">
                                <th className="text-left py-3 px-4 font-semibold text-neutral-500 dark:text-neutral-400">User</th>
                                <th className="text-left py-3 px-4 font-semibold text-neutral-500 dark:text-neutral-400">Role</th>
                                <th className="text-left py-3 px-4 font-semibold text-neutral-500 dark:text-neutral-400">Status</th>
                                <th className="text-left py-3 px-4 font-semibold text-neutral-500 dark:text-neutral-400">Joined</th>
                                <th className="text-right py-3 px-4 font-semibold text-neutral-500 dark:text-neutral-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                                                {u.name?.[0]?.toUpperCase() || "?"}
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900 dark:text-neutral-100">{u.name || "Anonymous"}</p>
                                                <p className="text-xs text-neutral-400">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.role === "ADMIN" ? "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" :
                                            u.role === "COOK" ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" :
                                                "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300"
                                            }`}>{u.role}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-block h-2 w-2 rounded-full ${u.isActive ? "bg-accent-500" : "bg-red-500"}`} />
                                        <span className="ml-2 text-xs text-neutral-500">{u.isActive ? "Active" : "Suspended"}</span>
                                    </td>
                                    <td className="py-3 px-4 text-neutral-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            {u.isActive ? (
                                                <button onClick={() => adminAction("moderate_user", { userId: u.id, modAction: "suspend" })} className="rounded-lg bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300">Suspend</button>
                                            ) : (
                                                <button onClick={() => adminAction("moderate_user", { userId: u.id, modAction: "activate" })} className="rounded-lg bg-accent-50 px-2 py-1 text-xs text-accent-600 hover:bg-accent-100 dark:bg-accent-900/30 dark:text-accent-300">Activate</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && <EmptyState emoji="👥" title="No users" subtitle="No users registered yet" />}
                </div>
            )}

            {/* Kitchens Tab */}
            {activeTab === "kitchens" && (
                <div className="animate-fade-in overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 dark:border-neutral-700">
                                <th className="text-left py-3 px-4 font-semibold text-neutral-500 dark:text-neutral-400">Kitchen</th>
                                <th className="text-left py-3 px-4 font-semibold text-neutral-500 dark:text-neutral-400">Owner</th>
                                <th className="text-left py-3 px-4 font-semibold text-neutral-500 dark:text-neutral-400">Status</th>
                                <th className="text-left py-3 px-4 font-semibold text-neutral-500 dark:text-neutral-400">Rating</th>
                                <th className="text-right py-3 px-4 font-semibold text-neutral-500 dark:text-neutral-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {kitchens.map((k) => (
                                <tr key={k.id} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                    <td className="py-3 px-4">
                                        <p className="font-medium text-neutral-900 dark:text-neutral-100">{k.name}</p>
                                        <p className="text-xs text-neutral-400">{k.city}</p>
                                    </td>
                                    <td className="py-3 px-4">
                                        <p className="text-neutral-700 dark:text-neutral-300">{k.owner?.name || "Unknown"}</p>
                                        <p className="text-xs text-neutral-400">{k.owner?.email}</p>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${k.status === "ACTIVE" ? "bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300" :
                                            k.status === "SUSPENDED" ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300" :
                                                "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300"
                                            }`}>
                                            {k.status} {k.isVerified && "✓"}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-neutral-500">
                                        ⭐ {Number(k.avgRating) > 0 ? Number(k.avgRating).toFixed(1) : "New"} ({k.reviewCount})
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            {k.status === "ACTIVE" ? (
                                                <button onClick={() => adminAction("moderate_kitchen", { kitchenId: k.id, modAction: "suspend" })} className="rounded-lg bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300">Suspend</button>
                                            ) : (
                                                <button onClick={() => adminAction("moderate_kitchen", { kitchenId: k.id, modAction: "activate" })} className="rounded-lg bg-accent-50 px-2 py-1 text-xs text-accent-600 hover:bg-accent-100 dark:bg-accent-900/30 dark:text-accent-300">Activate</button>
                                            )}
                                            {!k.isVerified && (
                                                <button onClick={() => adminAction("moderate_kitchen", { kitchenId: k.id, modAction: "verify" })} className="rounded-lg bg-primary-50 px-2 py-1 text-xs text-primary-600 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300">Verify</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {kitchens.length === 0 && <EmptyState emoji="🏠" title="No kitchens" subtitle="No kitchens registered yet" />}
                </div>
            )}

            {/* Audit Log Tab */}
            {activeTab === "audit" && (
                <div className="animate-fade-in space-y-3">
                    {auditLog.length === 0 ? (
                        <EmptyState emoji="📋" title="No activity" subtitle="No admin actions recorded yet" />
                    ) : (
                        auditLog.map((entry) => (
                            <div key={entry.id} className="rounded-xl border border-neutral-200/60 bg-white p-4 shadow-sm dark:bg-neutral-800 dark:border-neutral-700">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                                        {entry.admin?.name?.[0]?.toUpperCase() || "A"}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{entry.admin?.name || "Admin"}</span>
                                            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">{entry.action}</span>
                                            <span className="text-xs text-neutral-400">{entry.targetType}: {entry.targetId.slice(0, 8)}...</span>
                                        </div>
                                        {entry.details && <p className="text-xs text-neutral-500 mt-1">{entry.details}</p>}
                                    </div>
                                    <span className="text-xs text-neutral-400 flex-shrink-0">{new Date(entry.createdAt).toLocaleString()}</span>
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

function EmptyState({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
    return (
        <div className="text-center py-12 rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-600">
            <span className="text-4xl block mb-3">{emoji}</span>
            <h3 className="font-semibold text-neutral-700 dark:text-neutral-300">{title}</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>
        </div>
    );
}
