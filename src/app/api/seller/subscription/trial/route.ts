import { NextRequest } from "next/server";
import { requireSeller } from "@/lib/auth/seller-guard";
import { startFreeTrial } from "@/services/premium.service";
import {
    apiSuccess,
    apiBadRequest,
    apiInternalError,
} from "@/lib/utils/api-response";
import { AppError } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";

/**
 * POST /api/seller/subscription/trial
 * Auth required (COOK): Start a 30-day free trial.
 */
export async function POST(request: NextRequest) {
    try {
        const guard = await requireSeller(request);
        if (!guard.ok) return guard.response;
        const { user, kitchen } = guard;

        const result = await startFreeTrial(kitchen.id, user.id);

        return apiSuccess(result);
    } catch (error) {
        if (error instanceof AppError) {
            return apiBadRequest(error.message);
        }
        logger.error("Free trial start failed", {
            error: error instanceof Error ? error.message : "Unknown error",
        });
        return apiInternalError("Failed to start free trial");
    }
}
