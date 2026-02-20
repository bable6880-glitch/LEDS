"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import { type ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <RoleGuard allowedRoles={["COOK", "ADMIN"]}>
            {children}
        </RoleGuard>
    );
}
