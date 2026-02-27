CREATE TYPE "public"."delivery_mode" AS ENUM('SELF_PICKUP', 'FREE_DELIVERY');--> statement-breakpoint
CREATE TYPE "public"."menu_availability" AS ENUM('AVAILABLE', 'OUT_OF_STOCK', 'NOT_TODAY', 'PREPARING');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('STRIPE', 'JAZZCASH', 'EASYPAISA', 'BANK_TRANSFER', 'SADAPAY', 'FREE_TRIAL');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan_type" AS ENUM('BASE_MONTHLY', 'BASE_2MONTH', 'BASE_4MONTH');--> statement-breakpoint
ALTER TYPE "public"."subscription_status" ADD VALUE 'TRIALING' BEFORE 'ACTIVE';--> statement-breakpoint
ALTER TYPE "public"."subscription_status" ADD VALUE 'SUSPENDED';--> statement-breakpoint
ALTER TABLE "kitchens" ALTER COLUMN "country" SET DEFAULT 'Pakistan';--> statement-breakpoint
ALTER TABLE "meals" ALTER COLUMN "currency" SET DEFAULT 'PKR';--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "currency" SET DEFAULT 'PKR';--> statement-breakpoint
ALTER TABLE "premium_plans" ALTER COLUMN "currency" SET DEFAULT 'PKR';--> statement-breakpoint
ALTER TABLE "premium_plans" ALTER COLUMN "region" SET DEFAULT 'PK';--> statement-breakpoint
ALTER TABLE "kitchens" ADD COLUMN "delivery_options" text[];--> statement-breakpoint
ALTER TABLE "kitchens" ADD COLUMN "is_open" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "kitchens" ADD COLUMN "trial_ends_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "kitchens" ADD COLUMN "is_trial_used" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "meals" ADD COLUMN "availability_status" "menu_availability" DEFAULT 'AVAILABLE' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_mode" "delivery_mode" DEFAULT 'SELF_PICKUP' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "estimated_minutes" integer;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_lat" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_lng" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_address" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_method" "payment_method" DEFAULT 'STRIPE';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_status" varchar(20) DEFAULT 'UNPAID' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "stripe_payment_intent_id" varchar(255);--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "menu_item_id" uuid;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "is_pinned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "seller_reply" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "seller_replied_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "is_verified_purchase" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "plan_type" "subscription_plan_type";--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "payment_method" "payment_method" DEFAULT 'STRIPE' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "grace_period_ends_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "auto_renew" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "cancel_reason" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "fcm_token" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_menu_item_id_meals_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."meals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "subscriptions_period_end_idx" ON "subscriptions" USING btree ("current_period_end");