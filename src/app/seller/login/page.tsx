"use client";

import { useAuth } from "@/lib/firebase/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cookLoginSchema, type CookLoginInput } from "@/lib/validations/auth";
import Link from "next/link";

export default function SellerLoginPage() {
    const { user, loading: authLoading, signInWithEmail, error: authError } = useAuth();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<CookLoginInput>({
        resolver: zodResolver(cookLoginSchema) as never,
    });

    useEffect(() => {
        if (user && !authLoading) {
            if (user.role === "COOK" || user.role === "ADMIN") {
                router.push("/dashboard");
            } else {
                router.push("/become-a-cook");
            }
        }
    }, [user, authLoading, router]);

    const onSubmit = async (data: CookLoginInput) => {
        await signInWithEmail(data.email, data.password);
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex">
            {/* ── Left: Hero Panel (warm orange theme) ── */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #EA580C 0%, #F97316 30%, #FB923C 60%, #FCD34D 100%)" }}>
                <div className="absolute inset-0">
                    <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute bottom-10 right-10 h-56 w-56 rounded-full bg-yellow-300/15 blur-3xl" />
                    <div className="absolute top-1/3 right-1/4 h-40 w-40 rounded-full bg-orange-300/10 blur-2xl" />
                </div>

                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <span className="text-6xl mb-6">👨‍🍳</span>
                    <h2 className="text-4xl font-extrabold leading-tight">
                        Welcome Back,<br />
                        <span className="text-yellow-200">Chef!</span>
                    </h2>
                    <p className="mt-6 text-lg text-orange-100 leading-relaxed max-w-md">
                        Manage your kitchen, track orders, and grow your home food
                        business — all from one dashboard.
                    </p>

                    <div className="mt-10 grid grid-cols-2 gap-4">
                        <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4">
                            <p className="text-2xl font-bold">📦</p>
                            <p className="text-sm mt-1 text-orange-100">Track Orders</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4">
                            <p className="text-2xl font-bold">🍱</p>
                            <p className="text-sm mt-1 text-orange-100">Manage Menu</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4">
                            <p className="text-2xl font-bold">⭐</p>
                            <p className="text-sm mt-1 text-orange-100">View Reviews</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-4">
                            <p className="text-2xl font-bold">📊</p>
                            <p className="text-sm mt-1 text-orange-100">Analytics</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right: Login Form ── */}
            <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2 bg-gradient-to-br from-orange-50/50 to-white dark:from-neutral-900 dark:to-neutral-800">
                <div className="w-full max-w-md animate-slide-up">
                    {/* Mobile hero */}
                    <div className="lg:hidden text-center mb-8">
                        <span className="text-5xl block mb-3">👨‍🍳</span>
                        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-50">
                            Seller Login
                        </h1>
                        <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                            Sign in to manage your kitchen
                        </p>
                    </div>

                    {/* Card with gradient border */}
                    <div className="relative">
                        <div className="absolute -inset-0.5 rounded-[1.75rem] bg-gradient-to-r from-orange-400 to-yellow-400 opacity-20 blur-sm" />
                        <div className="relative rounded-3xl border border-orange-200/50 bg-white/90 backdrop-blur-xl p-8 shadow-xl shadow-orange-100/30 dark:bg-neutral-800/90 dark:border-neutral-700 dark:shadow-neutral-900/40">
                            <div className="hidden lg:block text-center mb-6">
                                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                                    Sign In to Your Kitchen 🔥
                                </h1>
                                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                                    Enter your credentials to access the dashboard
                                </p>
                            </div>

                            {authError && (
                                <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300 flex items-center gap-2">
                                    <span>⚠️</span>
                                    <span>{authError}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1.5 dark:text-neutral-300">
                                        Email Address
                                    </label>
                                    <input
                                        {...register("email")}
                                        type="email"
                                        placeholder="cook@example.com"
                                        className="w-full rounded-xl border-2 border-neutral-200 bg-neutral-50/50 px-4 py-3 text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-200 dark:focus:border-orange-500 dark:focus:ring-orange-900/30"
                                    />
                                    {errors.email && (
                                        <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            Password
                                        </label>
                                        <Link
                                            href="/seller/forgot-password"
                                            className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline dark:text-orange-400"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <input
                                            {...register("password")}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            className="w-full rounded-xl border-2 border-neutral-200 bg-neutral-50/50 px-4 py-3 pr-12 text-sm focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-200 dark:focus:border-orange-500 dark:focus:ring-orange-900/30"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1 transition-colors"
                                        >
                                            {showPassword ? "🙈" : "👁️"}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || authLoading}
                                    className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:from-orange-600 hover:to-orange-700 transition-all active:scale-[0.97] disabled:opacity-60"
                                >
                                    {isSubmitting || authLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            Signing in...
                                        </span>
                                    ) : "Sign In →"}
                                </button>
                            </form>

                            <div className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                                Don&apos;t have a seller account?{" "}
                                <Link
                                    href="/seller/register"
                                    className="font-bold text-orange-600 hover:underline dark:text-orange-400"
                                >
                                    Register here →
                                </Link>
                            </div>

                            <div className="mt-3 text-center text-xs text-neutral-400 dark:text-neutral-500">
                                Want to order food instead?{" "}
                                <Link href="/login" className="underline hover:text-primary-600 transition-colors">
                                    Customer Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
