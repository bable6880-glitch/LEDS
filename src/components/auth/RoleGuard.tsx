"use client";

import { useAuth, type AppUser } from "@/lib/firebase/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

type AllowedRole = AppUser["role"];

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles: AllowedRole[];
    /** Where to redirect if the user role is not allowed */
    redirectTo?: string;
}

/**
 * Client-side RBAC guard. Wraps pages/layouts to restrict access by role.
 * 
 * Usage:
 *   <RoleGuard allowedRoles={["COOK", "ADMIN"]}>{children}</RoleGuard>
 * 
 * If no user is logged in, redirects to /login (or /seller/login for cook pages).
 * If user role doesn't match, redirects to the appropriate home page.
 */
export function RoleGuard({ children, allowedRoles, redirectTo }: RoleGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) return; // Still loading auth state

        if (!user) {
            // Not logged in — redirect to appropriate login
            const isCookPage = pathname.startsWith("/dashboard") || pathname.startsWith("/seller");
            const loginUrl = isCookPage ? "/seller/login" : `/login?redirect=${encodeURIComponent(pathname)}`;
            router.replace(loginUrl);
            return;
        }

        // User is logged in but role doesn't match
        if (!allowedRoles.includes(user.role)) {
            if (redirectTo) {
                router.replace(redirectTo);
            } else {
                // Smart redirect based on role
                const target = user.role === "COOK" ? "/dashboard" : "/explore";
                router.replace(target);
            }
        }
    }, [user, loading, allowedRoles, redirectTo, router, pathname]);

    // Show loading state while checking
    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Checking access...</p>
                </div>
            </div>
        );
    }

    // Not logged in or wrong role — show nothing while redirecting
    if (!user || !allowedRoles.includes(user.role)) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Redirecting...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
