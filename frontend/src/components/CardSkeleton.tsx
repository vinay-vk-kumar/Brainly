interface CardSkeletonProps {
    type?: "youtube" | "twitter" | "article" | "default";
}

function ShimmerOverlay() {
    return (
        <div
            className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-2xl"
            aria-hidden
        >
            <div className="absolute inset-y-0 w-2/5 animate-skeleton-shine bg-gradient-to-r from-transparent via-indigo-200/35 dark:via-white/8 to-transparent" />
        </div>
    );
}

export const CardSkeleton = ({ type = "default" }: CardSkeletonProps) => {
    const bar = "rounded-md bg-gray-200/90 dark:bg-gray-700/90";
    const renderContent = () => {
        switch (type) {
            case "youtube":
                return (
                    <div className="mt-4 space-y-3">
                        <div className={`h-48 ${bar} w-full`} />
                        <div className="space-y-2">
                            <div className={`h-3 ${bar} w-full`} />
                            <div className={`h-3 ${bar} w-2/3`} />
                        </div>
                    </div>
                );
            case "twitter":
                return (
                    <div className="mt-4 rounded-lg border border-gray-100/80 p-4 dark:border-gray-700/80">
                        <div className="mb-3 flex gap-3">
                            <div className={`h-10 w-10 shrink-0 rounded-full ${bar}`} />
                            <div className="w-full space-y-2">
                                <div className={`h-3 ${bar} w-1/3`} />
                                <div className={`h-3 ${bar} w-1/4`} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className={`h-3 ${bar} w-full`} />
                            <div className={`h-3 ${bar} w-full`} />
                            <div className={`h-3 ${bar} w-3/4`} />
                        </div>
                    </div>
                );
            case "article":
                return (
                    <div className="mt-4 rounded-lg border border-gray-100/80 bg-gray-50/50 p-3 dark:border-gray-700/80 dark:bg-gray-800/30">
                        <div className={`mb-3 h-32 w-full rounded-md ${bar}`} />
                        <div className="space-y-2">
                            <div className={`h-3 ${bar} w-3/4`} />
                            <div className={`h-3 ${bar} w-1/2`} />
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="mt-4 space-y-2">
                        <div className={`h-32 w-full rounded-lg ${bar}`} />
                        <div className={`h-3 ${bar} w-full`} />
                        <div className={`h-3 ${bar} w-2/3`} />
                    </div>
                );
        }
    };

    return (
        <div className="relative flex h-fit w-full flex-col overflow-hidden rounded-2xl border border-gray-100/90 bg-white/95 p-5 shadow-sm dark:border-gray-700/90 dark:bg-gray-800/95">
            <ShimmerOverlay />
            <div className="relative z-0 flex animate-pulse flex-col">
                <div className="mb-2 flex items-start justify-between">
                    <div className="flex w-full items-center gap-2.5">
                        <div className={`h-9 w-9 shrink-0 rounded-lg ${bar}`} />
                        <div className={`h-4 w-3/4 rounded ${bar}`} />
                    </div>
                    <div className={`h-5 w-5 rounded ${bar}`} />
                </div>
                {renderContent()}
                <div className="mt-4 flex items-center border-t border-gray-100/80 pt-3 dark:border-gray-700/50">
                    <div className={`h-3 w-24 rounded ${bar}`} />
                </div>
            </div>
        </div>
    );
};
