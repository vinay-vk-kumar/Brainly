import { Loader2 } from "lucide-react";

type SpinnerProps = {
    className?: string;
    size?: "sm" | "md" | "lg";
    label?: string;
};

const sizeMap = { sm: 18, md: 28, lg: 40 };

export function Spinner({ className = "", size = "md", label }: SpinnerProps) {
    const px = sizeMap[size];
    return (
        <span className={`inline-flex items-center justify-center ${className}`} role="status" aria-label={label || "Loading"}>
            <Loader2 size={px} className="animate-spin text-indigo-600 dark:text-indigo-400" aria-hidden />
        </span>
    );
}

export function FullPageLoader({ message = "Loading…" }: { message?: string }) {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-gray-50/85 dark:bg-gray-950/85 backdrop-blur-sm transition-colors">
            <Spinner size="lg" label={message} />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 animate-pulse">{message}</p>
        </div>
    );
}
