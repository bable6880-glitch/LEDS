# Smart Tiffin - Project Overview

Smart Tiffin is a modern web application designed to connect home cooks (Sellers) with customers looking for home-cooked food. This document provides a high-level overview of the codebase, its structure, and core flows to help AI agents understand the system.

## 🚀 Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (hosted on Neon)
- **ORM**: Drizzle ORM
- **Authentication**: Firebase Authentication
- **Payments**: Stripe (for seller premium subscriptions)
- **Image Uploads**: Cloudinary
- **Mapping**: Leaflet (via react-leaflet)

## 📂 Folder Structure

```text
├── public/                 # Static assets (logos, images)
├── src/
│   ├── app/                # Next.js App Router (Pages & API Routes)
│   │   ├── (auth)/         # Auth-related pages (login, register)
│   │   ├── admin/          # Admin panel
│   │   ├── api/            # Backend API endpoints
│   │   │   ├── auth/       # Firebase sync & token handling
│   │   │   ├── kitchens/   # Kitchen management, menu, analytics
│   │   │   ├── orders/     # Order placement & status updates
│   │   │   └── premium/    # Subscription & plan management
│   │   ├── dashboard/      # Seller/Cook dashboard
│   │   ├── explore/        # Kitchen discovery page
│   │   ├── kitchen/[id]/   # Public kitchen profile & ordering
│   │   └── orders/         # Customer order history (hidden for now)
│   ├── components/         # React components grouped by feature
│   │   ├── cart/           # Shopping cart logic (inline)
│   │   ├── dashboard/      # Seller-specific UI components
│   │   ├── layout/         # Navbar, Footer, etc.
│   │   ├── map/            # Leaflet map integration
│   │   ├── menu/           # Meal item components
│   │   └── ui/             # Reusable base components (buttons, cards)
│   ├── config/             # Global configurations
│   ├── lib/                # Core logic & utilities
│   │   ├── auth/           # Auth helpers (getAuthUser)
│   │   ├── db/             # Drizzle schema and connection
│   │   ├── firebase/       # Firebase client/admin setup
│   │   ├── utils/          # API response & formatting helpers
│   │   └── validations/    # Zod schemas for form/API validation
│   ├── services/           # Business logic layer (Service classes)
│   └── middleware.ts       # Route protection and RBAC
├── drizzle/                # DB Migrations
├── drizzle.config.ts       # Drizzle configuration
└── next.config.ts          # Next.js configuration
```

## 🗄️ Database Schema (`src/lib/db/schema.ts`)

- **`users`**: Stores user profiles. Roles: `CUSTOMER`, `COOK`, `ADMIN`. Linked to Firebase UID.
- **`kitchens`**: The core "Shop" entity. Managed by a `COOK`. Stores location, ratings, and status.
- **`meals`**: Menu items within a kitchen. Each has a price, category, and availability status.
- **`orders`**: Transaction records. Connects `CUSTOMER` to `KITCHEN`.
- **`order_items`**: Line items within an order with price snapshots.
- **`subscriptions`**: Cook premium plans. Managed via Stripe.
- **`boosts`**: Featured placement for kitchens on the explore page.
- **`reports`**: Abuse/Quality reports.
- **`admin_audit_log`**: Detailed log of admin actions.

## 🔄 Core Flows

### 1. Authentication & Role Separation
- Users sign in via Firebase (Google/Email/WhatsApp).
- After login, the `middleware.ts` handles redirection based on role.
- **RBAC**: Strictly enforced in the Navbar and API routes. Sellers cannot access customer ordering features (Cart is hidden for them).

### 2. Seller Flow (Cook)
- **Onboarding**: Register a kitchen (handled via `/become-a-cook`).
- **Management**: Dashboard for menu items, orders, and analytics.
- **Subscription**: Can upgrade to Premium for better visibility.
- **Order Management**: Cooks accept, prepare, and complete orders.

### 3. Customer Flow (Buyer)
- **Discovery**: Home page with featured kitchens, search by city/area.
- **Menu**: View a kitchen's menu.
- **Ordering**: Add to cart (handled via `CartPanel.tsx`, which is always context-aware).
- **Checkout**: Order goes directly to the cook. No complex separate cart page.

### 4. Admin Flow
- Global overview, user management, and audit logs.

## ⚠️ Important Implementation Notes

- **Database Transactions**: The project uses the **Neon HTTP Driver**, which does **not** support `db.transaction()`. All multi-step inserts/updates must be performed sequentially.
- **Hydration**: Client-side states (like the cart and auth) are deferred or handled with `suppressHydrationWarning` to match SSR.
- **API Responses**: Always uses the standard helpers in `@/lib/utils/api-response` for consistency.
- **Validation**: All API inputs are validated using **Zod** schemas in `@/lib/validations`.

## 📍 Key Files for AI Agents

- `src/lib/db/schema.ts`: The source of truth for the data model.
- `src/components/layout/Navbar.tsx`: Controls the visibility of features based on role.
- `src/app/api/orders/route.ts`: Handling the main transaction of the app.
- `src/lib/auth/get-auth-user.ts`: The standard way to verify identity in API routes.
