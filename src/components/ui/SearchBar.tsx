"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type SearchBarProps = {
    initialCity?: string;
    initialQuery?: string;
    compact?: boolean;
};

export default function SearchBar({ initialCity = "", initialQuery = "", compact = false }: SearchBarProps) {
    const [city, setCity] = useState(initialCity);
    const [query, setQuery] = useState(initialQuery);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const cities = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan"];

    const handleSearch = useCallback(() => {
        const params = new URLSearchParams();
        if (city) params.set("city", city);
        if (query) params.set("q", query);
        startTransition(() => {
            router.push(`/explore?${params.toString()}`);
        });
    }, [city, query, router]);

    return (
        <div className={`flex flex-col sm:flex-row gap-2 ${compact ? "" : "max-w-2xl mx-auto"}`}>
            {/* City Select */}
            <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={`rounded-xl border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-200 ${compact ? "py-2.5" : "py-3"}`}
                aria-label="Select city"
            >
                <option value="">All Cities</option>
                {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                ))}
            </select>

            {/* Search Input */}
            <div className="relative flex-1">
                <svg
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Search kitchens, cuisines..."
                    className={`w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-4 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-200 dark:placeholder:text-neutral-500 ${compact ? "py-2.5" : "py-3"}`}
                    aria-label="Search kitchens"
                />
            </div>

            {/* Search Button */}
            <button
                onClick={handleSearch}
                disabled={isPending}
                className={`rounded-xl bg-primary-500 px-6 font-semibold text-white shadow-sm hover:bg-primary-600 active:scale-95 transition-all disabled:opacity-60 ${compact ? "py-2.5 text-sm" : "py-3 text-sm"}`}
            >
                {isPending ? "..." : "Search"}
            </button>
        </div>
    );
}
