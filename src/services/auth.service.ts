import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verifyFirebaseToken } from "@/lib/auth/firebase-admin";
import { eq } from "drizzle-orm";
import type { DecodedIdToken } from "firebase-admin/auth";

export type AuthUser = {
    id: string;
    firebaseUid: string;
    email: string | null;
    name: string | null;
    avatar: string | null;
    role: "CUSTOMER" | "COOK" | "ADMIN";
    isActive: boolean;
};

/**
 * Verify Firebase token and return the DB user.
 * Creates user if not found (first-time login).
 */
export async function authenticateUser(idToken: string): Promise<AuthUser> {
    // 1. Verify Firebase token
    const decoded: DecodedIdToken = await verifyFirebaseToken(idToken);

    // 2. Find user in DB
    const existing = await db.query.users.findFirst({
        where: eq(users.firebaseUid, decoded.uid),
    });

    if (existing) {
        if (!existing.isActive) {
            throw new Error("Account is suspended");
        }

        // Update last login
        await db
            .update(users)
            .set({ lastLoginAt: new Date(), updatedAt: new Date() })
            .where(eq(users.id, existing.id));

        return {
            id: existing.id,
            firebaseUid: existing.firebaseUid,
            email: existing.email,
            name: existing.name,
            avatar: existing.avatarUrl,
            role: existing.role,
            isActive: existing.isActive,
        };
    }

    // 3. Create new user (first-time login)
    const [newUser] = await db
        .insert(users)
        .values({
            firebaseUid: decoded.uid,
            email: decoded.email ?? null,
            name: decoded.name ?? decoded.email?.split("@")[0] ?? null,
            avatarUrl: decoded.picture ?? null,
            role: "CUSTOMER",
            isEmailVerified: decoded.email_verified ?? false,
            isPhoneVerified: !!decoded.phone_number,
            phone: decoded.phone_number ?? null,
            lastLoginAt: new Date(),
        })
        .returning();

    return {
        id: newUser.id,
        firebaseUid: newUser.firebaseUid,
        email: newUser.email,
        name: newUser.name,
        avatar: newUser.avatarUrl,
        role: newUser.role,
        isActive: newUser.isActive,
    };
}

/**
 * Sync user data from Firebase token — used on login.
 */
export async function syncUser(idToken: string) {
    return authenticateUser(idToken);
}

/**
 * Get user by Firebase UID.
 */
export async function getUserByFirebaseUid(firebaseUid: string) {
    return db.query.users.findFirst({
        where: eq(users.firebaseUid, firebaseUid),
    });
}

/**
 * Get user by internal ID.
 */
export async function getUserById(userId: string) {
    return db.query.users.findFirst({
        where: eq(users.id, userId),
    });
}

/**
 * Update user role (e.g., upgrade to COOK).
 */
export async function updateUserRole(
    userId: string,
    role: "CUSTOMER" | "COOK" | "ADMIN"
) {
    const [updated] = await db
        .update(users)
        .set({ role, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();

    return updated;
}
