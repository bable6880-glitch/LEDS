// CHANGED [P3]: Added loading skeleton for /dashboard
export default function DashboardLoading() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            {/* Header skeleton */}
            <div className="mb-8">
                <div className="h-8 w-64 rounded-lg bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                <div className="mt-2 h-4 w-48 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
            </div>

            {/* Stat cards skeleton */}
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-2xl border border-neutral-200/60 bg-white p-5 shadow-sm dark:bg-neutral-800 dark:border-neutral-700">
                        <div className="h-6 w-6 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                        <div className="mt-3 h-8 w-16 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                        <div className="mt-1 h-3 w-20 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                    </div>
                ))}
            </div>

            {/* Top sections skeleton */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {[1, 2].map((i) => (
                    <div key={i} className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:bg-neutral-800 dark:border-neutral-700">
                        <div className="h-5 w-32 rounded bg-neutral-200 animate-pulse mb-4 dark:bg-neutral-700" />
                        <div className="space-y-3">
                            {[1, 2, 3].map((j) => (
                                <div key={j} className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                                    <div className="flex-1">
                                        <div className="h-4 w-24 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                                        <div className="mt-1 h-3 w-16 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
