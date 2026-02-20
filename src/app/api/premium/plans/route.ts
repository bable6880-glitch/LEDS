import { NextRequest } from "next/server";
import { listPlans } from "@/services/premium.service";
import { apiSuccess, apiInternalError } from "@/lib/utils/api-response";

/**
 * GET /api/premium/plans
 * Public: List premium plans for a region.
 */
export async function GET(request: NextRequest) {
    try {
        const region = request.nextUrl.searchParams.get("region") || "IN";
        const plans = await listPlans(region);
        return apiSuccess(plans);
    } catch (error) {
        console.error("[List Plans Error]", error);
        return apiInternalError("Failed to fetch plans");
    }
}
