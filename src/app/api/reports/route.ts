import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import {
    apiCreated,
    apiBadRequest,
    apiUnauthorized,
    apiInternalError,
} from "@/lib/utils/api-response";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { z } from "zod";

// CHANGED [U1]: Dedicated endpoint for submitting reports

const reportSchema = z.object({
    targetType: z.enum(["KITCHEN", "REVIEW", "USER"]),
    targetId: z.string().uuid("Invalid target ID"),
    reason: z.string().min(3, "Reason must be at least 3 characters").max(500),
    details: z.string().max(2000).optional(),
});

/**
 * POST /api/reports
 * Auth required: Submit a report for a kitchen, review, or user.
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) return apiUnauthorized();

        const body = await request.json();
        const parsed = reportSchema.safeParse(body);

        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
            return apiBadRequest("Invalid report data", errors);
        }

        const [report] = await db
            .insert(reports)
            .values({
                reporterId: user.id,
                targetType: parsed.data.targetType,
                targetId: parsed.data.targetId,
                reason: parsed.data.reason,
                details: parsed.data.details || null,
                status: "PENDING",
            })
            .returning();

        return apiCreated(report);
    } catch (error) {
        console.error("[Submit Report Error]", error);
        return apiInternalError("Failed to submit report");
    }
}
