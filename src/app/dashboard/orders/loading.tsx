// CHANGED [P3]: Added loading skeleton for /dashboard/orders
export default function OrdersLoading() {
    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="h-7 w-44 rounded-lg bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                    <div className="mt-2 h-4 w-56 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                </div>
                <div className="h-9 w-9 rounded-lg bg-neutral-200 animate-pulse dark:bg-neutral-700" />
            </div>

            {/* Tab bar skeleton */}
            <div className="flex border-b border-neutral-200 mb-6 dark:border-neutral-800">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="px-6 py-3">
                        <div className="h-4 w-16 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                    </div>
                ))}
            </div>

            {/* Order card skeletons */}
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-neutral-200/60 bg-white p-5 shadow-sm dark:bg-neutral-800 dark:border-neutral-700">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <div className="h-5 w-32 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                                <div className="mt-2 h-4 w-24 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                            </div>
                            <div className="h-6 w-20 rounded-full bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                        </div>
                        <div className="flex gap-2 mt-3">
                            {[1, 2].map((j) => (
                                <div key={j} className="h-12 w-28 rounded-lg bg-neutral-100 animate-pulse dark:bg-neutral-700/50" />
                            ))}
                        </div>
                        <div className="mt-3 flex gap-2">
                            <div className="h-8 w-20 rounded-lg bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                            <div className="h-8 w-20 rounded-lg bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
