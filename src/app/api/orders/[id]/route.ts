import { NextRequest } from "next/server";
import { apiSuccess, apiUnauthorized, apiNotFound, apiForbidden, apiInternalError } from "@/lib/utils/api-response";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
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

        const order = await db.query.orders.findFirst({
            where: eq(orders.id, orderId),
            with: {
                kitchen: true,
                items: {
                    with: {
                        meal: true,
                    },
                },
                customer: true,
            },
        });

        if (!order) {
            return apiNotFound("Order not found");
        }

        // Access control: Only customer or kitchen owner/admin can view
        const isCustomer = order.customerId === user.id;
        const isOwner = order.kitchen.ownerId === user.id;

        if (!isCustomer && !isOwner && user.role !== "ADMIN") {
            return apiForbidden();
        }

        return apiSuccess(order);

    } catch (error) {
        console.error("[Get Order Error]", error);
        return apiInternalError();
    }
}
