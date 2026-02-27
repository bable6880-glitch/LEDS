import { NextRequest } from "next/server";
import { apiSuccess, apiUnauthorized, apiNotFound, apiForbidden, apiBadRequest, apiInternalError } from "@/lib/utils/api-response";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateOrderStatusSchema } from "@/lib/validations/order";

export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return apiUnauthorized();
        }

        const orderId = params.id;
        const body = await request.json();

        const parsed = updateOrderStatusSchema.safeParse(body);
        if (!parsed.success) {
            return apiBadRequest("Invalid status data");
        }

        const { status, estimatedMinutes } = parsed.data;

        // Get order to verify ownership
        const order = await db.query.orders.findFirst({
            where: eq(orders.id, orderId),
            with: {
                kitchen: true,
            },
        });

        if (!order) {
            return apiNotFound("Order not found");
        }

        // Verify user owns the kitchen for this order
        if (user.role !== "ADMIN" && order.kitchen.ownerId !== user.id) {
            return apiForbidden();
        }

        // Update status
        const [updatedOrder] = await db
            .update(orders)
            .set({
                status,
                estimatedMinutes: estimatedMinutes || order.estimatedMinutes,
                acceptedAt: status === "ACCEPTED" ? new Date() : order.acceptedAt,
                completedAt: status === "COMPLETED" ? new Date() : order.completedAt,
                cancelledAt: status === "CANCELLED" ? new Date() : order.cancelledAt,
                updatedAt: new Date(),
            })
            .where(eq(orders.id, orderId))
            .returning();

        // N2: Notification on status change
        if (status === "ACCEPTED" || status === "COMPLETED") {
            const { notifyOrderAccepted, notifyOrderCompleted } = await import("@/services/notification.service");
            if (status === "ACCEPTED") {
                await notifyOrderAccepted(order.customerId, orderId, order.kitchen.name);
            } else {
                await notifyOrderCompleted(order.customerId, orderId, order.kitchen.name);
            }
        }

        return apiSuccess(updatedOrder);

    } catch (error) {
        console.error("[Update Order Status Error]", error);
        return apiInternalError();
    }
}
