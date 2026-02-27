/**
 * Seed premium plans into the database.
 *
 * Usage:   npx tsx src/scripts/seed-plans.ts
 * Env:     Reads DATABASE_URL from .env.local
 */
import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "../lib/db/schema";
import { premiumPlans } from "../lib/db/schema";
import { eq, and } from "drizzle-orm";
import { SUBSCRIPTION_PLANS } from "../lib/validations/subscription";

neonConfig.poolQueryViaFetch = true;

async function seedPlans() {
    if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL is not set");
        process.exit(1);
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });

    console.log("🌱 Seeding premium plans...\n");

    // Check if plans already exist
    const existing = await db.query.premiumPlans.findMany({
        where: and(eq(premiumPlans.region, "PK"), eq(premiumPlans.isActive, true)),
    });

    if (existing.length > 0) {
        console.log(`✅ ${existing.length} plan(s) already exist. Updating...\n`);

        // Update existing plan with latest pricing
        await db
            .update(premiumPlans)
            .set({
                name: "Smart Tiffin Pro",
                description:
                    "Full access to the Smart Tiffin platform for home cooks",
                priceMonthly: SUBSCRIPTION_PLANS.BASE_MONTHLY.price,
                priceQuarterly: SUBSCRIPTION_PLANS.BASE_2MONTH.price,
                priceYearly: SUBSCRIPTION_PLANS.BASE_4MONTH.price,
                currency: "PKR",
                features: [
                    "Kitchen listing on platform",
                    "Unlimited menu items",
                    "Order management dashboard",
                    "Customer reviews & analytics",
                    "Priority in search results",
                ],
                includesVerifiedBadge: false,
                includesBoost: false,
                boostDurationDays: null,
                updatedAt: new Date(),
            })
            .where(eq(premiumPlans.id, existing[0].id));

        console.log(`  Updated plan: ${existing[0].id}`);
    } else {
        // Insert new plan
        const [plan] = await db
            .insert(premiumPlans)
            .values({
                name: "Smart Tiffin Pro",
                description:
                    "Full access to the Smart Tiffin platform for home cooks",
                priceMonthly: SUBSCRIPTION_PLANS.BASE_MONTHLY.price,
                priceQuarterly: SUBSCRIPTION_PLANS.BASE_2MONTH.price,
                priceYearly: SUBSCRIPTION_PLANS.BASE_4MONTH.price,
                currency: "PKR",
                region: "PK",
                features: [
                    "Kitchen listing on platform",
                    "Unlimited menu items",
                    "Order management dashboard",
                    "Customer reviews & analytics",
                    "Priority in search results",
                ],
                includesVerifiedBadge: false,
                includesBoost: false,
                boostDurationDays: null,
                isActive: true,
            })
            .returning();

        console.log(`  Created plan: ${plan.id}`);
    }

    console.log("\n✅ Premium plans seeded successfully!");
    console.log("\nPlan Pricing:");
    console.log(`  1 Month:  ${SUBSCRIPTION_PLANS.BASE_MONTHLY.displayPrice}`);
    console.log(`  2 Months: ${SUBSCRIPTION_PLANS.BASE_2MONTH.displayPrice}`);
    console.log(`  4 Months: ${SUBSCRIPTION_PLANS.BASE_4MONTH.displayPrice}`);

    await pool.end();
    process.exit(0);
}

seedPlans().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
