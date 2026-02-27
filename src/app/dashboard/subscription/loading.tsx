// CHANGED [P3]: Added loading skeleton for /dashboard/subscription
export default function SubscriptionLoading() {
    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            {/* Header skeleton */}
            <div className="mb-8">
                <div className="h-7 w-52 rounded-lg bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                <div className="mt-2 h-4 w-64 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
            </div>

            {/* Current status skeleton */}
            <div className="mb-8 rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:bg-neutral-800 dark:border-neutral-700">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-5 w-32 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                        <div className="mt-2 h-4 w-48 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                    </div>
                    <div className="h-8 w-24 rounded-full bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                </div>
            </div>

            {/* Plan cards skeleton */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:bg-neutral-800 dark:border-neutral-700">
                        <div className="h-5 w-20 rounded bg-neutral-200 animate-pulse mb-2 dark:bg-neutral-700" />
                        <div className="h-8 w-28 rounded bg-neutral-200 animate-pulse mb-4 dark:bg-neutral-700" />
                        <div className="space-y-2">
                            {[1, 2, 3, 4].map((j) => (
                                <div key={j} className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                                    <div className="h-3 w-32 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 h-10 w-full rounded-xl bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                    </div>
                ))}
            </div>
        </div>
    );
}
