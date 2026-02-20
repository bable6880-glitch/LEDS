import { NextRequest } from "next/server";
import { apiSuccess, apiUnauthorized, apiBadRequest, apiInternalError } from "@/lib/utils/api-response";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { db } from "@/lib/db";
import { orders, orderItems, meals, kitchens } from "@/lib/db/schema";
import { createOrderSchema } from "@/lib/validations/order";
import { eq, inArray } from "drizzle-orm";

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) {
            return apiUnauthorized();
        }

        const body = await request.json();
        const parsed = createOrderSchema.safeParse(body);

        if (!parsed.success) {
            return apiBadRequest("Invalid order data", parsed.error.flatten().fieldErrors);
        }

        const { kitchenId, items, notes, deliveryMode, customerAddress, customerLat, customerLng } = parsed.data;

        // Verify kitchen exists and is active
        const kitchen = await db.query.kitchens.findFirst({
            where: eq(kitchens.id, kitchenId),
        });

        if (!kitchen || kitchen.status !== "ACTIVE") {
            return apiBadRequest("Kitchen not found or unavailable");
        }

        // Verify items and calculate total
        const mealIds = items.map((i) => i.mealId);
        const mealRecords = await db.query.meals.findMany({
            where: inArray(meals.id, mealIds),
        });

        if (mealRecords.length !== items.length) {
            return apiBadRequest("One or more items not found");
        }

        let totalAmount = 0;
        const prepareItems = items.map((item) => {
            const meal = mealRecords.find((m) => m.id === item.mealId);
            if (!meal) throw new Error(`Meal ${item.mealId} not found`); // Should not happen

            // Check availability
            if (!meal.isAvailable) {
                throw new Error(`Meal "${meal.name}" is currently unavailable`);
            }

            const itemTotal = meal.price * item.quantity;
            totalAmount += itemTotal;

            return {
                mealId: item.mealId,
                quantity: item.quantity,
                price: meal.price, // Snapshot price at time of order
                notes: item.notes,
            };
        });

        // Create Order Transaction
        const newOrder = await db.transaction(async (tx) => {
            const [order] = await tx
                .insert(orders)
                .values({
                    kitchenId,
                    customerId: user.id,
                    status: "PENDING",
                    totalAmount,
                    currency: "PKR",
                    notes,
                    deliveryMode,
                    customerAddress,
                    customerLat: customerLat ? customerLat.toString() : null,
                    customerLng: customerLng ? customerLng.toString() : null,
                })
                .returning();

            for (const item of prepareItems) {
                await tx.insert(orderItems).values({
                    orderId: order.id,
                    mealId: item.mealId,
                    quantity: item.quantity,
                    priceAtOrder: item.price,
                    notes: item.notes,
                });
            }

            return order;
        });

        return apiSuccess(newOrder);

    } catch (error: any) {
        if (error.message.includes("is currently unavailable")) {
            return apiBadRequest(error.message);
        }
        console.error("[Create Order Error]", error);
        return apiInternalError("Failed to place order");
    }
}
