import { NextRequest } from "next/server";
import {
    getReports,
    resolveReport,
    moderateKitchen,
    moderateUser,
    getPlatformStats,
} from "@/services/admin.service";
import {
    apiSuccess,
    apiBadRequest,
    apiUnauthorized,
    apiForbidden,
    apiNotFound,
    apiInternalError,
    apiPaginated,
} from "@/lib/utils/api-response";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { z } from "zod";
import { AppError } from "@/lib/utils/errors";

// ─── Helper: Require Admin ──────────────────────────────────────────────────

async function requireAdmin(request: NextRequest) {
    const user = await getAuthUser(request);
    if (!user) return { user: null, error: apiUnauthorized() };
    if (user.role !== "ADMIN") return { user: null, error: apiForbidden("Admin access required") };
    return { user, error: null };
}

/**
 * GET /api/admin/stats
 * Admin only: Platform statistics.
 */
export async function GET(request: NextRequest) {
    try {
        const { error } = await requireAdmin(request);
        if (error) return error;

        const action = request.nextUrl.searchParams.get("action");

        if (action === "stats") {
            const stats = await getPlatformStats();
            return apiSuccess(stats);
        }

        // Default: list reports
        const status = request.nextUrl.searchParams.get("status") as
            | "PENDING"
            | "REVIEWED"
            | "RESOLVED"
            | "DISMISSED"
            | undefined;
        const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
        const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");

        const result = await getReports(status || undefined, page, limit);

        return apiPaginated(result.reports, {
            page: result.page,
            limit: result.limit,
            total: result.total,
        });
    } catch (error) {
        console.error("[Admin Error]", error);
        return apiInternalError("Admin operation failed");
    }
}

// ─── Admin Actions Schema ───────────────────────────────────────────────────

const adminActionSchema = z.discriminatedUnion("action", [
    z.object({
        action: z.literal("resolve_report"),
        reportId: z.string().uuid(),
        resolution: z.string().min(1),
        status: z.enum(["RESOLVED", "DISMISSED"]),
    }),
    z.object({
        action: z.literal("moderate_kitchen"),
        kitchenId: z.string().uuid(),
        modAction: z.enum(["suspend", "activate", "verify"]),
        reason: z.string().optional(),
    }),
    z.object({
        action: z.literal("moderate_user"),
        userId: z.string().uuid(),
        modAction: z.enum(["suspend", "activate", "make_admin"]),
        reason: z.string().optional(),
    }),
    z.object({
        action: z.literal("delete_review"),
        reviewId: z.string().uuid(),
    }),
]);

/**
 * POST /api/admin
 * Admin only: Execute admin actions.
 */
export async function POST(request: NextRequest) {
    try {
        const { user, error } = await requireAdmin(request);
        if (error) return error;

        const body = await request.json();
        const parsed = adminActionSchema.safeParse(body);

        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
            return apiBadRequest("Invalid admin action", errors);
        }

        const data = parsed.data;

        switch (data.action) {
            case "resolve_report": {
                const result = await resolveReport(
                    data.reportId,
                    user!.id,
                    data.resolution,
                    data.status
                );
                return apiSuccess(result);
            }

            case "moderate_kitchen": {
                const result = await moderateKitchen(
                    data.kitchenId,
                    user!.id,
                    data.modAction,
                    data.reason
                );
                return apiSuccess(result);
            }

            case "moderate_user": {
                const result = await moderateUser(
                    data.userId,
                    user!.id,
                    data.modAction,
                    data.reason
                );
                return apiSuccess(result);
            }

            case "delete_review": {
                const { deleteReview } = await import("@/services/review.service");
                const result = await deleteReview(data.reviewId);
                return apiSuccess(result);
            }
        }
    } catch (error) {
        if (error instanceof AppError) {
            if (error.statusCode === 404) return apiNotFound(error.message);
        }
        console.error("[Admin Action Error]", error);
        return apiInternalError("Admin action failed");
    }
}
