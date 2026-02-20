import { NextRequest } from "next/server";
import { apiSuccess, apiUnauthorized, apiNotFound, apiForbidden, apiInternalError } from "@/lib/utils/api-response";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { db } from "@/lib/db";
import { orders, kitchens } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

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

        const kitchenId = params.id;

        // Verify ownership
        // In real app, we should check if user is owner of this kitchen
        // For now, let's just check if user is a COOK and has this kitchen

        const kitchen = await db.query.kitchens.findFirst({
            where: eq(kitchens.id, kitchenId),
        });

        if (!kitchen) {
            return apiNotFound("Kitchen not found");
        }

        if (user.role !== "ADMIN" && kitchen.ownerId !== user.id) {
            return apiForbidden();
        }

        // Fetch orders with items and customer info
        const kitchenOrders = await db.query.orders.findMany({
            where: eq(orders.kitchenId, kitchenId),
            with: {
                items: {
                    with: {
                        meal: true, // Fetch meal details for names
                    },
                },
                customer: true, // Fetch customer details for name/contact
            },
            orderBy: [desc(orders.createdAt)],
            limit: 50, // Pagination later
        });

        return apiSuccess(kitchenOrders);

    } catch (error) {
        console.error("[Get Kitchen Orders Error]", error);
        return apiInternalError();
    }
}
