import { NextRequest } from "next/server";
import { cloudinary } from "@/lib/utils/cloudinary";
import {
    apiSuccess,
    apiBadRequest,
    apiUnauthorized,
    apiInternalError,
} from "@/lib/utils/api-response";
import { getAuthUser } from "@/lib/auth/get-auth-user";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/upload
 * Auth required: Upload an image to Cloudinary.
 * Accepts FormData with `file` (required) and `folder` (optional: meals|kitchens|avatars).
 * Returns { url, publicId }.
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        if (!user) return apiUnauthorized();

        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const folder = (formData.get("folder") as string) || "meals";

        if (!file) {
            return apiBadRequest("No file provided");
        }

        // Validate type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return apiBadRequest(
                "Invalid file type. Allowed: JPG, PNG, WebP"
            );
        }

        // Validate size
        if (file.size > MAX_SIZE) {
            return apiBadRequest("File too large. Maximum size is 5MB");
        }

        // Convert file to buffer → base64 data URI for Cloudinary
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

        // Upload to Cloudinary (no transformation to avoid signature issues)
        const result = await cloudinary.uploader.upload(base64, {
            folder: `smart-tiffin/${folder}`,
            resource_type: "image",
        });

        return apiSuccess({
            url: result.secure_url,
            publicId: result.public_id,
        });
    } catch (error) {
        console.error("[Upload Error]", error);
        return apiInternalError("Failed to upload image");
    }
}
