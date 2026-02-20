import { db } from "@/lib/db";
import { reports, kitchens, reviews, users, adminAuditLog } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { NotFoundError } from "@/lib/utils/errors";

// ─── Get Reports ────────────────────────────────────────────────────────────

export async function getReports(
    status?: "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED",
    page = 1,
    limit = 20
) {
    const conditions = status ? [eq(reports.status, status)] : [];
    const offset = (page - 1) * limit;

    const [data, countResult] = await Promise.all([
        db.query.reports.findMany({
            where: conditions.length ? and(...conditions) : undefined,
            orderBy: [desc(reports.createdAt)],
            limit,
            offset,
            with: {
                reporter: {
                    columns: { id: true, name: true, email: true },
                },
            },
        }),
        db
            .select({ count: sql<number>`count(*)` })
            .from(reports)
            .where(conditions.length ? and(...conditions) : undefined),
    ]);

    return {
        reports: data,
        total: Number(countResult[0].count),
        page,
        limit,
    };
}

// ─── Resolve Report ─────────────────────────────────────────────────────────

export async function resolveReport(
    reportId: string,
    adminId: string,
    resolution: string,
    status: "RESOLVED" | "DISMISSED"
) {
    const report = await db.query.reports.findFirst({
        where: eq(reports.id, reportId),
    });

    if (!report) throw new NotFoundError("Report");

    const [updated] = await db
        .update(reports)
        .set({
            status,
            reviewedBy: adminId,
            reviewedAt: new Date(),
            resolution,
        })
        .where(eq(reports.id, reportId))
        .returning();

    // Log admin action
    await logAdminAction(adminId, `report_${status.toLowerCase()}`, "report", reportId, resolution);

    return updated;
}

// ─── Moderate Kitchen ───────────────────────────────────────────────────────

export async function moderateKitchen(
    kitchenId: string,
    adminId: string,
    action: "suspend" | "activate" | "verify",
    reason?: string
) {
    const kitchen = await db.query.kitchens.findFirst({
        where: eq(kitchens.id, kitchenId),
    });

    if (!kitchen) throw new NotFoundError("Kitchen");

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    switch (action) {
        case "suspend":
            updateData.status = "SUSPENDED";
            break;
        case "activate":
            updateData.status = "ACTIVE";
            break;
        case "verify":
            updateData.isVerified = true;
            break;
    }

    const [updated] = await db
        .update(kitchens)
        .set(updateData)
        .where(eq(kitchens.id, kitchenId))
        .returning();

    await logAdminAction(
        adminId,
        `kitchen_${action}`,
        "kitchen",
        kitchenId,
        reason
    );

    return updated;
}

// ─── Moderate User ──────────────────────────────────────────────────────────

export async function moderateUser(
    userId: string,
    adminId: string,
    action: "suspend" | "activate" | "make_admin",
    reason?: string
) {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    if (!user) throw new NotFoundError("User");

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    switch (action) {
        case "suspend":
            updateData.isActive = false;
            break;
        case "activate":
            updateData.isActive = true;
            break;
        case "make_admin":
            updateData.role = "ADMIN";
            break;
    }

    const [updated] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();

    await logAdminAction(adminId, `user_${action}`, "user", userId, reason);

    return updated;
}

// ─── Platform Stats ─────────────────────────────────────────────────────────

export async function getPlatformStats() {
    const [userCount, kitchenCount, orderCount, reviewCount] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(users),
        db.select({ count: sql<number>`count(*)` }).from(kitchens),
        db
            .select({ count: sql<number>`count(*)` })
            .from(
                // Use the orders table directly
                sql`orders`
            ),
        db.select({ count: sql<number>`count(*)` }).from(reviews),
    ]);

    return {
        totalUsers: Number(userCount[0].count),
        totalKitchens: Number(kitchenCount[0].count),
        totalOrders: Number(orderCount[0].count),
        totalReviews: Number(reviewCount[0].count),
    };
}

// ─── Audit Log ──────────────────────────────────────────────────────────────

async function logAdminAction(
    adminId: string,
    action: string,
    targetType: string,
    targetId: string,
    details?: string
) {
    await db.insert(adminAuditLog).values({
        adminId,
        action,
        targetType,
        targetId,
        details,
    });
}
