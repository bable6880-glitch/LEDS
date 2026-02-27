import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { orders, kitchens } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
    apiSuccess,
    apiBadRequest,
    apiUnauthorized,
    apiNotFound,
    apiInternalError,
} from "@/lib/utils/api-response";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import Stripe from "stripe";
import { z } from "zod";

// CHANGED [N1]: Stripe payment flow for customer orders

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-06-20" as any, // Bypass strict type check for stripe version
});

const createPaymentSchema = z.object({
    orderId: z.string().uuid("Invalid order ID"),
});

/**
 * POST /api/orders/payment
 * Auth required (CUSTOMER): Create a Stripe Payment Intent for an existing order.
 * Returns the client_secret so the frontend can complete payment via Stripe Elements.
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) return apiUnauthorized();

        const body = await request.json();
        const parsed = createPaymentSchema.safeParse(body);

        if (!parsed.success) {
            return apiBadRequest("Invalid data", parsed.error.flatten().fieldErrors as Record<string, string[]>);
        }

        const { orderId } = parsed.data;

        // Find the order and verify ownership
        const order = await db.query.orders.findFirst({
            where: and(eq(orders.id, orderId), eq(orders.customerId, user.id)),
        });

        if (!order) return apiNotFound("Order not found");
        if (order.paymentStatus === "PAID") {
            return apiBadRequest("This order has already been paid");
        }

        const amount = order.totalAmount || 0;
        if (amount <= 0) {
            return apiBadRequest("Order amount is invalid");
        }

        // Create or retrieve Stripe Payment Intent
        let paymentIntent: Stripe.PaymentIntent;

        if (order.stripePaymentIntentId) {
            // Retrieve existing Payment Intent
            paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
        } else {
            // Create new Payment Intent
            paymentIntent = await stripe.paymentIntents.create({
                amount, // Already in smallest currency unit (paisa)
                currency: order.currency.toLowerCase(),
                metadata: {
                    orderId: order.id,
                    customerId: user.id,
                    kitchenId: order.kitchenId,
                },
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            // Save the Payment Intent ID on the order
            await db
                .update(orders)
                .set({
                    stripePaymentIntentId: paymentIntent.id,
                    paymentMethod: "STRIPE",
                    updatedAt: new Date(),
                })
                .where(eq(orders.id, orderId));
        }

        return apiSuccess({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
        });
    } catch (error) {
        console.error("[Create Payment Intent Error]", error);
        return apiInternalError("Failed to create payment");
    }
}

/**
 * PATCH /api/orders/payment
 * Auth required: Confirm payment was successful (called after Stripe confirms on frontend).
 */
const confirmPaymentSchema = z.object({
    orderId: z.string().uuid(),
    paymentIntentId: z.string(),
});

export async function PATCH(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) return apiUnauthorized();

        const body = await request.json();
        const parsed = confirmPaymentSchema.safeParse(body);

        if (!parsed.success) {
            return apiBadRequest("Invalid data");
        }

        const { orderId, paymentIntentId } = parsed.data;

        // Verify payment with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== "succeeded") {
            return apiBadRequest(`Payment not completed. Status: ${paymentIntent.status}`);
        }

        // Verify order ownership
        const order = await db.query.orders.findFirst({
            where: and(eq(orders.id, orderId), eq(orders.customerId, user.id)),
        });

        if (!order) return apiNotFound("Order not found");

        // Update order payment status
        const [updated] = await db
            .update(orders)
            .set({
                paymentStatus: "PAID",
                stripePaymentIntentId: paymentIntentId,
                updatedAt: new Date(),
            })
            .where(eq(orders.id, orderId))
            .returning();

        // N2: Send payment received notification to cook
        const { notifyPaymentReceived } = await import("@/services/notification.service");
        // Get kitchen owner ID to notify 
        const kitchen = await db.query.kitchens.findFirst({
            where: eq(kitchens.id, order.kitchenId),
            columns: { ownerId: true }
        });

        if (kitchen) {
            await notifyPaymentReceived(kitchen.ownerId, order.id, updated.totalAmount || 0);
        }

        return apiSuccess(updated);
    } catch (error) {
        console.error("[Confirm Payment Error]", error);
        return apiInternalError("Failed to confirm payment");
    }
}
