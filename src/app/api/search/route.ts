import { NextRequest } from "next/server";
import { kitchenQuerySchema } from "@/lib/validations/kitchen";
import { listKitchens } from "@/services/kitchen.service";
import {
    apiPaginated,
    apiBadRequest,
    apiInternalError,
} from "@/lib/utils/api-response";

/**
 * GET /api/search
 * Public: Full search with all filters.
 * Query params: city, area, cuisine, dietary, minRating, maxPrice, sort, page, limit
 */
export async function GET(request: NextRequest) {
    try {
        const params = Object.fromEntries(request.nextUrl.searchParams);
        const parsed = kitchenQuerySchema.safeParse(params);

        if (!parsed.success) {
            const errors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
            return apiBadRequest("Invalid search parameters", errors);
        }

        const result = await listKitchens(parsed.data);

        return apiPaginated(result.kitchens, {
            page: result.page,
            limit: result.limit,
            total: result.total,
        });
    } catch (error) {
        console.error("[Search Error]", error);
        return apiInternalError("Search failed");
    }
}
