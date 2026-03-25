import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

//@ts-ignore
export function Input({ placeholder, ref, type, onKeyDown, ...rest }: { placeholder: string, ref?: any, type?: string, onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void, [key: string]: any }) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : (type || "text");

    return (
        <div className="relative">
            {/* @ts-ignore */}
            <input
                ref={ref}
                placeholder={placeholder}
                type={inputType}
                onKeyDown={onKeyDown}
                className="w-full px-4 py-3 border border-gray-200/90 rounded-xl bg-white/90 dark:bg-gray-800/85 dark:border-gray-700/90 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/70 dark:focus:ring-indigo-400/70 focus:border-indigo-400/60 dark:focus:border-indigo-400/60 transition-all pr-10 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            {isPassword && (
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            )}
        </div>
    )
}