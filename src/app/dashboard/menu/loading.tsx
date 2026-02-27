// CHANGED [P3]: Added loading skeleton for /dashboard/menu
export default function MenuLoading() {
    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            {/* Header + Add button skeleton */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="h-7 w-36 rounded-lg bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                    <div className="mt-2 h-4 w-48 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                </div>
                <div className="h-10 w-28 rounded-xl bg-neutral-200 animate-pulse dark:bg-neutral-700" />
            </div>

            {/* Meal card skeletons */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-xl border border-neutral-200/60 bg-white p-4 shadow-sm dark:bg-neutral-800 dark:border-neutral-700">
                        <div className="flex gap-4">
                            <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                            <div className="flex-1">
                                <div className="h-5 w-28 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                                <div className="mt-2 h-3 w-full rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                                <div className="mt-3 flex items-center justify-between">
                                    <div className="h-5 w-16 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                                    <div className="flex gap-2">
                                        <div className="h-7 w-7 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                                        <div className="h-7 w-7 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
