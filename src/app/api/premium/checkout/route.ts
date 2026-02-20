import { NextRequest } from "next/server";
import { createSubscriptionCheckout } from "@/services/premium.service";
import {
    apiSuccess,
    apiBadRequest,
    apiUnauthorized,
    apiForbidden,
    apiInternalError,
} from "@/lib/utils/api-response";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { z } from "zod";
import { AppError } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";

const checkoutSchema = z.object({
    kitchenId: z.string().uuid(),
    planId: z.string().uuid().optional(),
    planType: z.enum(["BASE_MONTHLY", "BASE_2MONTH", "BASE_4MONTH"]).optional(),
    billingCycle: z.enum(["monthly", "quarterly", "yearly"]).optional(),
    paymentMethod: z.string().default("STRIPE"),
});

/**
 * POST /api/premium/checkout
 * Auth required (COOK): Create Stripe checkout session.
 * Legacy route — prefer /api/seller/subscription/checkout
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) return apiUnauthorized();

        if (user.role !== "COOK" && user.role !== "ADMIN") {
            return apiForbidden("Only cooks can purchase premium plans");
        }

        const body = await request.json();
        const parsed = checkoutSchema.safeParse(body);

        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
            return apiBadRequest("Invalid checkout data", errors);
        }

        // Map legacy billingCycle to new planType
        const planTypeMap: Record<string, "BASE_MONTHLY" | "BASE_2MONTH" | "BASE_4MONTH"> = {
            monthly: "BASE_MONTHLY",
            quarterly: "BASE_2MONTH",
            yearly: "BASE_4MONTH",
        };

        const planType =
            parsed.data.planType ||
            (parsed.data.billingCycle
                ? planTypeMap[parsed.data.billingCycle]
                : "BASE_MONTHLY");

        const result = await createSubscriptionCheckout(
            user.id,
            parsed.data.kitchenId,
            planType,
            parsed.data.paymentMethod
        );

        return apiSuccess(result);
    } catch (error) {
        if (error instanceof AppError) {
            return apiBadRequest(error.message);
        }
        logger.error("[Checkout Error]", {
            error: error instanceof Error ? error.message : "Unknown",
        });
        return apiInternalError("Failed to create checkout session");
    }
}
