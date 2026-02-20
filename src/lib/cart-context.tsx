"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CartItem {
    mealId: string;
    name: string;
    price: number;
    imageUrl: string | null;
    quantity: number;
}

export interface CartState {
    kitchenId: string | null;
    kitchenName: string | null;
    items: CartItem[];
}

interface CartContextType extends CartState {
    addItem: (kitchenId: string, kitchenName: string, item: Omit<CartItem, "quantity">) => boolean;
    removeItem: (mealId: string) => void;
    updateQuantity: (mealId: string, quantity: number) => void;
    clearCart: () => void;
    total: number;
    itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_KEY = "smart-tiffin-cart";

function loadCart(): CartState {
    if (typeof window === "undefined") return { kitchenId: null, kitchenName: null, items: [] };
    try {
        const raw = localStorage.getItem(CART_KEY);
        if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return { kitchenId: null, kitchenName: null, items: [] };
}

function saveCart(state: CartState) {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(state));
    } catch { /* ignore */ }
}

// ─── Provider ───────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartState>(loadCart);

    // Persist on change
    useEffect(() => {
        saveCart(cart);
    }, [cart]);

    const addItem = useCallback((kitchenId: string, kitchenName: string, item: Omit<CartItem, "quantity">): boolean => {
        let switched = false;
        setCart((prev) => {
            // If switching kitchens, clear old cart
            if (prev.kitchenId && prev.kitchenId !== kitchenId) {
                switched = true;
                return {
                    kitchenId,
                    kitchenName,
                    items: [{ ...item, quantity: 1 }],
                };
            }

            const existing = prev.items.find((i) => i.mealId === item.mealId);
            if (existing) {
                return {
                    ...prev,
                    kitchenId,
                    kitchenName,
                    items: prev.items.map((i) =>
                        i.mealId === item.mealId ? { ...i, quantity: i.quantity + 1 } : i
                    ),
                };
            }

            return {
                ...prev,
                kitchenId,
                kitchenName,
                items: [...prev.items, { ...item, quantity: 1 }],
            };
        });
        return !switched;
    }, []);

    const removeItem = useCallback((mealId: string) => {
        setCart((prev) => {
            const newItems = prev.items.filter((i) => i.mealId !== mealId);
            if (newItems.length === 0) return { kitchenId: null, kitchenName: null, items: [] };
            return { ...prev, items: newItems };
        });
    }, []);

    const updateQuantity = useCallback((mealId: string, quantity: number) => {
        if (quantity <= 0) {
            setCart((prev) => {
                const newItems = prev.items.filter((i) => i.mealId !== mealId);
                if (newItems.length === 0) return { kitchenId: null, kitchenName: null, items: [] };
                return { ...prev, items: newItems };
            });
            return;
        }
        setCart((prev) => ({
            ...prev,
            items: prev.items.map((i) =>
                i.mealId === mealId ? { ...i, quantity: Math.min(quantity, 50) } : i
            ),
        }));
    }, []);

    const clearCart = useCallback(() => {
        setCart({ kitchenId: null, kitchenName: null, items: [] });
    }, []);

    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{ ...cart, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}
        >
            {children}
        </CartContext.Provider>
    );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used inside CartProvider");
    return ctx;
}
