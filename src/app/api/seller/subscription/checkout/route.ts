import { NextRequest } from "next/server";
import { requireSeller } from "@/lib/auth/seller-guard";
import { createSubscriptionCheckout } from "@/services/premium.service";
import { subscriptionCheckoutSchema } from "@/lib/validations/subscription";
import {
    apiSuccess,
    apiBadRequest,
    apiInternalError,
} from "@/lib/utils/api-response";
import { AppError } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";

/**
 * POST /api/seller/subscription/checkout
 * Auth required (COOK): Create a checkout session for a subscription plan.
 */
export async function POST(request: NextRequest) {
    try {
        const guard = await requireSeller(request);
        if (!guard.ok) return guard.response;
        const { user, kitchen } = guard;

        const body = await request.json();

        // Auto-resolve kitchenId from the auth guard
        const dataWithKitchen = {
            ...body,
            kitchenId: kitchen.id,
        };

        const parsed = subscriptionCheckoutSchema.safeParse(dataWithKitchen);

        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors as Record<
                string,
                string[]
            >;
            return apiBadRequest("Invalid checkout data", errors);
        }

        const result = await createSubscriptionCheckout(
            user.id,
            kitchen.id,
            parsed.data.planType,
            parsed.data.paymentMethod
        );

        return apiSuccess(result);
    } catch (error) {
        if (error instanceof AppError) {
            return apiBadRequest(error.message);
        }
        logger.error("Checkout session creation failed", {
            error: error instanceof Error ? error.message : "Unknown error",
        });
        return apiInternalError("Failed to create checkout session");
    }
}
