import { NextRequest } from "next/server";
import { createMealSchema } from "@/lib/validations/menu";
import { createMeal, getMealsByKitchen } from "@/services/menu.service";
import {
    apiSuccess,
    apiCreated,
    apiBadRequest,
    apiUnauthorized,
    apiForbidden,
    apiInternalError,
} from "@/lib/utils/api-response";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { AppError } from "@/lib/utils/errors";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/kitchens/[id]/menu
 * Public: List all meals for a kitchen.
 */
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const meals = await getMealsByKitchen(id);
        return apiSuccess(meals);
    } catch (error) {
        console.error("[List Meals Error]", error);
        return apiInternalError("Failed to fetch meals");
    }
}

/**
 * POST /api/kitchens/[id]/menu
 * Auth required (Owner): Add a meal to the menu.
 */
export async function POST(request: NextRequest, { params }: Params) {
    try {
        const user = await getAuthUser(request);
        if (!user) return apiUnauthorized();

        const { id } = await params;
        const body = await request.json();
        const parsed = createMealSchema.safeParse(body);

        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
            return apiBadRequest("Invalid meal data", errors);
        }

        const meal = await createMeal(id, user.id, parsed.data);
        return apiCreated(meal);
    } catch (error) {
        if (error instanceof AppError) {
            if (error.statusCode === 404) return apiBadRequest(error.message);
            if (error.statusCode === 403) return apiForbidden(error.message);
        }
        console.error("[Create Meal Error]", error);
        return apiInternalError("Failed to create meal");
    }
}
