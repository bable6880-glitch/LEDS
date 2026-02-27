// CHANGED [P3]: Added loading skeleton for /dashboard/reviews
export default function ReviewsLoading() {
    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            {/* Header skeleton */}
            <div className="mb-8">
                <div className="h-7 w-40 rounded-lg bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                <div className="mt-2 h-4 w-52 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
            </div>

            {/* Rating summary skeleton */}
            <div className="mb-8 rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:bg-neutral-800 dark:border-neutral-700">
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <div className="h-12 w-16 rounded bg-neutral-200 animate-pulse mx-auto dark:bg-neutral-700" />
                        <div className="mt-2 h-3 w-20 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                    </div>
                    <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <div key={star} className="flex items-center gap-2">
                                <div className="h-3 w-6 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                                <div className="h-2 flex-1 rounded-full bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Review card skeletons */}
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-neutral-200/60 bg-white p-5 shadow-sm dark:bg-neutral-800 dark:border-neutral-700">
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-24 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                                    <div className="h-4 w-16 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                                </div>
                                <div className="mt-2 h-3 w-full rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                                <div className="mt-1 h-3 w-3/4 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
