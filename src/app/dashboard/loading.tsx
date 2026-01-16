export default function DashboardLoading() {
    return (
        <div className="min-h-screen pt-20 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Skeleton */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                    <div className="animate-pulse">
                        <div className="h-8 w-64 bg-zinc-800 rounded mb-2" />
                        <div className="h-4 w-48 bg-zinc-800 rounded" />
                    </div>
                </div>

                {/* Stats Skeleton */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-card border border-border p-6 animate-pulse">
                            <div className="h-8 w-16 bg-zinc-800 rounded mb-2" />
                            <div className="h-4 w-24 bg-zinc-800 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
