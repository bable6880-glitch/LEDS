import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// CHANGED [N2]: Notification service — in-app notifications + FCM push stub
// Firebase Cloud Messaging requires firebase-admin and service account setup.
// This service provides a unified notification API that works with or without FCM.

type NotificationType = "ORDER_PLACED" | "ORDER_ACCEPTED" | "ORDER_COMPLETED" | "ORDER_CANCELLED" | "NEW_REVIEW" | "SELLER_REPLY" | "PAYMENT_RECEIVED";

interface NotificationPayload {
    type: NotificationType;
    recipientId: string;
    title: string;
    body: string;
    data?: Record<string, string>;
}

// ─── In-App Notification (stored in DB for notification center) ─────────────

const notificationLog: NotificationPayload[] = [];

export async function sendNotification(payload: NotificationPayload): Promise<void> {
    try {
        // 1. Log notification (in-memory for now, can be stored in DB)
        notificationLog.push(payload);
        console.log(`[Notification] ${payload.type} → ${payload.recipientId}: ${payload.title}`);

        // 2. Attempt FCM push notification if available
        await sendFCMPush(payload);
    } catch (error) {
        console.error("[Notification Error]", error);
        // Notifications should never break the main flow
    }
}

// ─── FCM Push (requires firebase-admin) ────────────────────────────────────

async function sendFCMPush(payload: NotificationPayload): Promise<void> {
    try {
        // Check if firebase-admin is configured
        if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            // FCM not configured, skip push notification
            return;
        }

        // Get the user's FCM token from the database
        const user = await db.query.users.findFirst({
            where: eq(users.id, payload.recipientId),
            columns: { fcmToken: true },
        });

        if (!user?.fcmToken) return;

        // Dynamic import firebase-admin to avoid startup errors when not configured
        const admin = await import("firebase-admin");

        if (!admin.apps.length) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }

        await admin.messaging().send({
            token: user.fcmToken,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: payload.data || {},
            webpush: {
                notification: {
                    icon: "/icons/icon-192x192.png",
                    badge: "/icons/badge-72x72.png",
                },
                fcmOptions: {
                    link: payload.data?.url || "/",
                },
            },
        });

        console.log(`[FCM] Push sent to ${payload.recipientId}`);
    } catch (error) {
        console.warn("[FCM] Push failed (non-critical):", error);
    }
}

// ─── Pre-built Notification Templates ──────────────────────────────────────

export function notifyOrderPlaced(cookId: string, orderId: string, customerName: string) {
    return sendNotification({
        type: "ORDER_PLACED",
        recipientId: cookId,
        title: "🎉 New Order!",
        body: `${customerName} placed an order. Tap to view and accept.`,
        data: { orderId, url: `/dashboard/orders` },
    });
}

export function notifyOrderAccepted(customerId: string, orderId: string, kitchenName: string) {
    return sendNotification({
        type: "ORDER_ACCEPTED",
        recipientId: customerId,
        title: "✅ Order Accepted!",
        body: `${kitchenName} accepted your order and is preparing it now.`,
        data: { orderId, url: `/orders/${orderId}` },
    });
}

export function notifyOrderCompleted(customerId: string, orderId: string, kitchenName: string) {
    return sendNotification({
        type: "ORDER_COMPLETED",
        recipientId: customerId,
        title: "🎉 Order Ready!",
        body: `Your order from ${kitchenName} is ready for pickup/delivery.`,
        data: { orderId, url: `/orders/${orderId}` },
    });
}

export function notifyPaymentReceived(cookId: string, orderId: string, amount: number) {
    return sendNotification({
        type: "PAYMENT_RECEIVED",
        recipientId: cookId,
        title: "💰 Payment Received!",
        body: `You received Rs. ${amount.toLocaleString()} for your order.`,
        data: { orderId, url: `/dashboard/orders` },
    });
}

export function notifyNewReview(cookId: string, kitchenName: string, rating: number) {
    return sendNotification({
        type: "NEW_REVIEW",
        recipientId: cookId,
        title: `⭐ New ${rating}-star Review!`,
        body: `Someone left a review on ${kitchenName}. Tap to view.`,
        data: { url: `/dashboard/reviews` },
    });
}

export function notifySellerReply(customerId: string, kitchenName: string) {
    return sendNotification({
        type: "SELLER_REPLY",
        recipientId: customerId,
        title: "💬 Cook Replied!",
        body: `${kitchenName} replied to your review.`,
        data: { url: `/orders` },
    });
}
