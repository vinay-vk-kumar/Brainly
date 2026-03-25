import { ReactElement } from "react"
import { Loader2 } from "lucide-react"

interface ButtonProps {
    variant: "primary" | "secondary",
    text?: string,
    startIcon?: ReactElement,
    onClick?: any,
    fullWidth?: boolean,
    loading?: boolean
}

const variantStyle = {
    "primary": "bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 shadow-sm hover:shadow-md",
    "secondary": "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-200 dark:border dark:border-indigo-800/60 hover:bg-indigo-200/80 dark:hover:bg-indigo-900/40"
}

const defaultStyles =
    "flex items-center px-5 py-3 rounded-xl font-semibold cursor-pointer justify-center hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-out disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100"

export const Button = ({ variant, text, startIcon, onClick, fullWidth, loading }: ButtonProps) => {
    return (
        <button
            type="button"
            className={`${variantStyle[variant]} ${defaultStyles} ${fullWidth ? "w-full" : ""}`}
            onClick={onClick}
            disabled={loading}
        >
            <div className="pr-2 flex items-center justify-center">
                {loading ? <Loader2 className="animate-spin shrink-0" size={20} aria-hidden /> : startIcon}
            </div>
            <div>{text}</div>
        </button>
    )
}