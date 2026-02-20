import { NextRequest } from "next/server";
import { createKitchenSchema, kitchenQuerySchema } from "@/lib/validations/kitchen";
import { createKitchen, listKitchens, getKitchensByOwner } from "@/services/kitchen.service";
import {
    apiSuccess,
    apiCreated,
    apiBadRequest,
    apiUnauthorized,
    apiInternalError,
    apiPaginated,
} from "@/lib/utils/api-response";
import { getAuthUser } from "@/lib/auth/get-auth-user";

/**
 * GET /api/kitchens
 * Public: Browse kitchens with filters.
 * Special: ?ownerId=me returns the authenticated user's kitchen(s).
 */
export async function GET(request: NextRequest) {
    try {
        const params = Object.fromEntries(request.nextUrl.searchParams);

        // Handle ownerId=me — return the authenticated user's kitchen(s)
        if (params.ownerId === "me") {
            const user = await getAuthUser(request);
            if (!user) return apiUnauthorized();

            const kitchens = await getKitchensByOwner(user.id);
            return apiSuccess(kitchens);
        }

        const parsed = kitchenQuerySchema.safeParse(params);

        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
            return apiBadRequest("Invalid query parameters", errors);
        }

        const result = await listKitchens(parsed.data);

        return apiPaginated(result.kitchens, {
            page: result.page,
            limit: result.limit,
            total: result.total,
        });
    } catch (error) {
        console.error("[List Kitchens Error]", error);
        return apiInternalError("Failed to fetch kitchens");
    }
}

/**
 * POST /api/kitchens
 * Auth required: Create a new kitchen (upgrades user to COOK role).
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) return apiUnauthorized();

        const body = await request.json();
        const parsed = createKitchenSchema.safeParse(body);

        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
            return apiBadRequest("Invalid kitchen data", errors);
        }

        const kitchen = await createKitchen(user.id, parsed.data);
        return apiCreated(kitchen);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[Create Kitchen Error]", error);

        if (message.includes("duplicate")) {
            return apiBadRequest("A kitchen with that name already exists");
        }

        return apiInternalError("Failed to create kitchen");
    }
}
