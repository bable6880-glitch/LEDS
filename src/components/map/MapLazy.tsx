"use client";

import dynamic from "next/dynamic";

const MapContent = dynamic(() => import("./MapContent"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-neutral-100 rounded-xl animate-pulse dark:bg-neutral-800">
            <span className="text-neutral-400">Loading Map...</span>
        </div>
    ),
});

export function MapLazy(props: React.ComponentProps<typeof MapContent>) {
    return <MapContent {...props} />;
}
