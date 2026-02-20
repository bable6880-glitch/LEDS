import { NextRequest } from "next/server";
import { requireSeller } from "@/lib/auth/seller-guard";
import { getSubscriptionStatus } from "@/services/premium.service";
import { apiSuccess, apiInternalError } from "@/lib/utils/api-response";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/seller/subscription/status
 * Auth required (COOK): Get current subscription status for the seller's kitchen.
 */
export async function GET(request: NextRequest) {
    try {
        const guard = await requireSeller(request);
        if (!guard.ok) return guard.response;
        const { kitchen } = guard;

        const status = await getSubscriptionStatus(kitchen.id);

        return apiSuccess(status);
    } catch (error) {
        logger.error("Failed to get subscription status", {
            error: error instanceof Error ? error.message : "Unknown error",
        });
        return apiInternalError("Failed to get subscription status");
    }
}
