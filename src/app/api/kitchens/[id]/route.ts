import { NextRequest } from "next/server";
import { updateKitchenSchema } from "@/lib/validations/kitchen";
import {
    getKitchenById,
    updateKitchen,
    deleteKitchen,
} from "@/services/kitchen.service";
import {
    apiSuccess,
    apiBadRequest,
    apiUnauthorized,
    apiForbidden,
    apiNotFound,
    apiInternalError,
} from "@/lib/utils/api-response";
import { getAuthUser } from "@/lib/auth/get-auth-user";
import { AppError } from "@/lib/utils/errors";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/kitchens/[id]
 * Public: Get kitchen profile.
 */
export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const kitchen = await getKitchenById(id);
        return apiSuccess(kitchen);
    } catch (error) {
        if (error instanceof AppError && error.statusCode === 404) {
            return apiNotFound("Kitchen not found");
        }
        console.error("[Get Kitchen Error]", error);
        return apiInternalError("Failed to fetch kitchen");
    }
}

/**
 * PUT /api/kitchens/[id]
 * Auth required (Owner): Update kitchen.
 */
export async function PUT(request: NextRequest, { params }: Params) {
    try {
        const user = await getAuthUser(request);
        if (!user) return apiUnauthorized();

        const { id } = await params;
        const body = await request.json();
        const parsed = updateKitchenSchema.safeParse(body);

        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
            return apiBadRequest("Invalid kitchen data", errors);
        }

        const kitchen = await updateKitchen(id, user.id, parsed.data);
        return apiSuccess(kitchen);
    } catch (error) {
        if (error instanceof AppError) {
            if (error.statusCode === 404) return apiNotFound(error.message);
            if (error.statusCode === 403) return apiForbidden(error.message);
        }
        console.error("[Update Kitchen Error]", error);
        return apiInternalError("Failed to update kitchen");
    }
}

/**
 * DELETE /api/kitchens/[id]
 * Auth required (Owner / Admin): Soft delete kitchen.
 */
export async function DELETE(request: NextRequest, { params }: Params) {
    try {
        const user = await getAuthUser(request);
        if (!user) return apiUnauthorized();

        const { id } = await params;
        await deleteKitchen(id, user.id, user.role);
        return apiSuccess({ deleted: true });
    } catch (error) {
        if (error instanceof AppError) {
            if (error.statusCode === 404) return apiNotFound(error.message);
            if (error.statusCode === 403) return apiForbidden(error.message);
        }
        console.error("[Delete Kitchen Error]", error);
        return apiInternalError("Failed to delete kitchen");
    }
}
