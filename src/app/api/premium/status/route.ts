import { NextRequest } from "next/server";
import { getSubscriptionStatus } from "@/services/premium.service";
import {
    apiSuccess,
    apiUnauthorized,
    apiForbidden,
    apiInternalError,
} from "@/lib/utils/api-response";
import { getAuthUser } from "@/lib/auth/get-auth-user";

/**
 * GET /api/premium/status?kitchenId=<uuid>
 * Auth required (COOK): Get current subscription status for a kitchen.
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) return apiUnauthorized();

        if (user.role !== "COOK" && user.role !== "ADMIN") {
            return apiForbidden("Only cooks can view subscription status");
        }

        const kitchenId = request.nextUrl.searchParams.get("kitchenId");
        if (!kitchenId) {
            return apiSuccess(null); // No kitchen specified
        }

        const subscription = await getSubscriptionStatus(kitchenId);
        return apiSuccess(subscription || null);
    } catch (error) {
        console.error("[Premium Status Error]", error);
        return apiInternalError("Failed to fetch subscription status");
    }
}
