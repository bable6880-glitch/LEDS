"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/firebase/auth-context";

export default function Navbar() {
    const { user, loading, signOutUser } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const isCook = user?.role === "COOK" || user?.role === "ADMIN";

    return (
        <header className="sticky top-0 z-50 glass border-b border-neutral-200/50 dark:border-neutral-800/50">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="text-2xl" aria-hidden>🍱</span>
                    <span className="text-xl font-bold text-gradient">
                        Smart Tiffin
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    <Link
                        href="/explore"
                        className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors dark:text-neutral-300 dark:hover:text-primary-400"
                    >
                        Explore Kitchens
                    </Link>

                    {loading ? (
                        <div className="h-8 w-20 rounded-lg animate-shimmer" />
                    ) : user ? (
                        <div className="flex items-center gap-4">
                            {/* Profile dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-100 transition-colors dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50"
                                >
                                    <span className="h-6 w-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">
                                        {user.name?.[0]?.toUpperCase() || "U"}
                                    </span>
                                    <span className="hidden sm:inline">{user.name?.split(" ")[0] || "User"}</span>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {profileOpen && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-neutral-200 py-2 animate-fade-in dark:bg-neutral-800 dark:border-neutral-700">
                                        <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-700">
                                            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{user.name}</p>
                                            <p className="text-xs text-neutral-500">{user.email}</p>
                                            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${isCook
                                                ? "bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300"
                                                : "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                                                }`}>
                                                {isCook ? "🍳 Cook" : "🛒 Customer"}
                                            </span>
                                        </div>

                                        {isCook && (
                                            <>
                                                <Link
                                                    href="/dashboard"
                                                    onClick={() => setProfileOpen(false)}
                                                    className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                                >
                                                    🏠 Dashboard
                                                </Link>
                                                <Link
                                                    href="/dashboard/orders"
                                                    onClick={() => setProfileOpen(false)}
                                                    className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                                >
                                                    📋 Kitchen Orders
                                                </Link>
                                            </>
                                        )}

                                        {user.role === "ADMIN" && (
                                            <Link
                                                href="/admin"
                                                onClick={() => setProfileOpen(false)}
                                                className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                            >
                                                ⚙️ Admin Panel
                                            </Link>
                                        )}

                                        <div className="border-t border-neutral-100 mt-1 pt-1 dark:border-neutral-700">
                                            <button
                                                onClick={() => { setProfileOpen(false); signOutUser(); }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link
                                href="/login"
                                className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 transition-all hover:shadow-md active:scale-95"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/seller/login"
                                className="rounded-lg border border-accent-500 px-4 py-2 text-sm font-semibold text-accent-600 hover:bg-accent-50 transition-all active:scale-95 dark:text-accent-400 dark:hover:bg-accent-900/20"
                            >
                                Cook Login
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </nav>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-neutral-200/50 bg-white/95 backdrop-blur-lg animate-fade-in dark:bg-neutral-900/95 dark:border-neutral-800/50">
                    <div className="px-4 py-3 space-y-1">
                        <Link
                            href="/explore"
                            onClick={() => setMobileOpen(false)}
                            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        >
                            🍽️ Explore Kitchens
                        </Link>

                        {user ? (
                            <>
                                <div className="border-t border-neutral-200 my-2 dark:border-neutral-700" />

                                {isCook && (
                                    <>
                                        <Link
                                            href="/dashboard"
                                            onClick={() => setMobileOpen(false)}
                                            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                        >
                                            🏠 Dashboard
                                        </Link>
                                        <Link
                                            href="/dashboard/orders"
                                            onClick={() => setMobileOpen(false)}
                                            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                                        >
                                            📋 Kitchen Orders
                                        </Link>
                                    </>
                                )}

                                {/* No "My Orders" or "Cart" for customers — clean flow */}

                                <button
                                    onClick={() => { setMobileOpen(false); signOutUser(); }}
                                    className="w-full text-left rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="block rounded-lg bg-primary-500 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-primary-600 mt-2"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/seller/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="block rounded-lg border border-accent-500 px-3 py-2.5 text-center text-sm font-semibold text-accent-600 hover:bg-accent-50 mt-1 dark:text-accent-400"
                                >
                                    Cook Login
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
