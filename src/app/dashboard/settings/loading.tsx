// CHANGED [P3]: Added loading skeleton for /dashboard/settings
export default function SettingsLoading() {
    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            {/* Header skeleton */}
            <div className="mb-8">
                <div className="h-7 w-44 rounded-lg bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                <div className="mt-2 h-4 w-60 rounded bg-neutral-200 animate-pulse dark:bg-neutral-700" />
            </div>

            {/* Image upload skeletons */}
            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-neutral-200/60 bg-white p-5 shadow-sm dark:bg-neutral-800 dark:border-neutral-700">
                    <div className="h-4 w-24 rounded bg-neutral-200 animate-pulse mb-3 dark:bg-neutral-700" />
                    <div className="h-32 w-full rounded-xl bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                </div>
                <div className="rounded-2xl border border-neutral-200/60 bg-white p-5 shadow-sm dark:bg-neutral-800 dark:border-neutral-700">
                    <div className="h-4 w-24 rounded bg-neutral-200 animate-pulse mb-3 dark:bg-neutral-700" />
                    <div className="h-32 w-full rounded-xl bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                </div>
            </div>

            {/* Form field skeletons */}
            <div className="rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-sm dark:bg-neutral-800 dark:border-neutral-700">
                <div className="space-y-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i}>
                            <div className="h-4 w-28 rounded bg-neutral-200 animate-pulse mb-2 dark:bg-neutral-700" />
                            <div className="h-10 w-full rounded-lg bg-neutral-100 animate-pulse dark:bg-neutral-700/50" />
                        </div>
                    ))}
                    <div className="pt-2">
                        <div className="h-10 w-28 rounded-xl bg-neutral-200 animate-pulse dark:bg-neutral-700" />
                    </div>
                </div>
            </div>
        </div>
    );
}
