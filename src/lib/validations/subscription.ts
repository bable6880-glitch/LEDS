import { z } from "zod";

// ─── Plan Type Constants ────────────────────────────────────────────────────

export const SUBSCRIPTION_PLANS = {
    BASE_MONTHLY: {
        type: "BASE_MONTHLY" as const,
        label: "1 Month",
        price: 599_00, // PKR in paisa (smallest unit)
        displayPrice: "Rs. 599",
        durationDays: 30,
        description: "Standard monthly subscription",
        perMonthDisplay: "Rs. 599/mo",
    },
    BASE_2MONTH: {
        type: "BASE_2MONTH" as const,
        label: "2 Months",
        price: 1_099_00,
        displayPrice: "Rs. 1,099",
        durationDays: 60,
        description: "Save Rs. 99 with 2-month plan",
        perMonthDisplay: "Rs. 550/mo",
    },
    BASE_4MONTH: {
        type: "BASE_4MONTH" as const,
        label: "4 Months",
        price: 2_099_00,
        displayPrice: "Rs. 2,099",
        durationDays: 120,
        description: "Best value — save Rs. 297",
        perMonthDisplay: "Rs. 525/mo",
    },
} as const;

export type SubscriptionPlanType = keyof typeof SUBSCRIPTION_PLANS;

export const TRIAL_DURATION_DAYS = 30;
export const GRACE_PERIOD_DAYS = 3;

// ─── Zod Schemas (Zod v4 compatible) ────────────────────────────────────────

export const subscriptionCheckoutSchema = z.object({
    kitchenId: z.string().uuid("Invalid kitchen ID"),
    planType: z.enum(["BASE_MONTHLY", "BASE_2MONTH", "BASE_4MONTH"]),
    paymentMethod: z.enum([
        "STRIPE",
        "JAZZCASH",
        "EASYPAISA",
        "BANK_TRANSFER",
        "SADAPAY",
    ]),
});

export type SubscriptionCheckoutInput = z.infer<
    typeof subscriptionCheckoutSchema
>;

export const cancelSubscriptionSchema = z.object({
    subscriptionId: z.string().uuid("Invalid subscription ID"),
    reason: z
        .string()
        .min(5, "Reason must be at least 5 characters")
        .max(500, "Reason must be at most 500 characters")
        .optional(),
});

export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>;
