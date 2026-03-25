import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeProvider";

export const ThemeToggle = ({ className = "" }: { className?: string }) => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <motion.button
            type="button"
            onClick={toggleTheme}
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.03 }}
            className={`relative p-2.5 rounded-xl bg-white/90 dark:bg-gray-800/90 border border-gray-200/80 dark:border-gray-600/80 text-amber-500 dark:text-amber-300 hover:border-indigo-300/60 dark:hover:border-indigo-500/40 shadow-sm hover:shadow-md backdrop-blur-sm transition-shadow duration-200 ${className}`}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={isDark}
        >
            <motion.span
                key={theme}
                initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="flex items-center justify-center"
            >
                {isDark ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
            </motion.span>
        </motion.button>
    );
};
