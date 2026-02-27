"use client";

import { useState } from "react";
import { useAuth } from "@/lib/firebase/auth-context";

// CHANGED [U1]: Report button component for reporting kitchens

type Props = {
    kitchenId: string;
    kitchenName: string;
};

export function ReportButton({ kitchenId, kitchenName }: Props) {
    const { user, getIdToken } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) return;

        setSubmitting(true);
        try {
            const token = await getIdToken();
            await fetch("/api/reports", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    targetType: "KITCHEN",
                    targetId: kitchenId,
                    reason: reason.trim(),
                    details: details.trim() || undefined,
                }),
            });

            setSubmitted(true);
            setShowForm(false);
        } catch (err) {
            console.error("Report error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) return null;
    if (submitted) {
        return (
            <p className="text-xs text-accent-600 dark:text-accent-400 flex items-center gap-1">
                ✅ Report submitted. Thank you.
            </p>
        );
    }

    return (
        <>
            <button
                onClick={() => setShowForm(!showForm)}
                className="text-xs text-neutral-400 hover:text-red-500 transition-colors flex items-center gap-1 dark:text-neutral-500 dark:hover:text-red-400"
            >
                🚩 Report this kitchen
            </button>

            {showForm && (
                <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:bg-neutral-800 dark:border-neutral-700">
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Report &quot;{kitchenName}&quot;
                    </p>
                    <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
                    >
                        <option value="">Select a reason</option>
                        <option value="Fake kitchen listing">Fake kitchen listing</option>
                        <option value="Food quality issue">Food quality issue</option>
                        <option value="Hygiene concern">Hygiene concern</option>
                        <option value="Harassment or abuse">Harassment or abuse</option>
                        <option value="Incorrect information">Incorrect information</option>
                        <option value="Other">Other</option>
                    </select>
                    <textarea
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="Additional details (optional)"
                        rows={3}
                        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm resize-none dark:bg-neutral-700 dark:border-neutral-600 dark:text-neutral-200"
                    />
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={submitting || !reason}
                            className="rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600 transition-all disabled:opacity-50"
                        >
                            {submitting ? "Submitting..." : "Submit Report"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="rounded-lg bg-neutral-200 px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-300 transition-all dark:bg-neutral-700 dark:text-neutral-300"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </>
    );
}
