export default function EventsLoading() {
    return (
        <div className="min-h-screen pt-20 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Skeleton */}
                <div className="mb-8 animate-pulse">
                    <div className="h-10 w-48 bg-zinc-800 rounded mb-4" />
                    <div className="h-4 w-96 bg-zinc-800 rounded" />
                </div>

                {/* Events Grid Skeleton */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-card border border-border overflow-hidden animate-pulse">
                            <div className="h-48 bg-zinc-800" />
                            <div className="p-4">
                                <div className="h-6 w-3/4 bg-zinc-800 rounded mb-2" />
                                <div className="h-4 w-1/2 bg-zinc-800 rounded mb-4" />
                                <div className="h-4 w-full bg-zinc-800 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
