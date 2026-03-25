import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "theme";

function getStoredTheme(): Theme | null {
    try {
        const v = localStorage.getItem(STORAGE_KEY);
        if (v === "light" || v === "dark") return v;
    } catch {
        /* ignore */
    }
    return null;
}

function getSystemTheme(): Theme {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyThemeToDocument(theme: Theme) {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.style.colorScheme = theme === "dark" ? "dark" : "light";
}

const ThemeContext = createContext<{
    theme: Theme;
    setTheme: (t: Theme) => void;
    toggleTheme: () => void;
}>({
    theme: "light",
    setTheme: () => {},
    toggleTheme: () => {},
});

function getInitialTheme(): Theme {
    return getStoredTheme() ?? getSystemTheme();
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setThemeState] = useState<Theme>(getInitialTheme);

    useEffect(() => {
        applyThemeToDocument(theme);
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            /* ignore */
        }
    }, [theme]);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const onChange = () => {
            if (getStoredTheme() !== null) return;
            setThemeState(mq.matches ? "dark" : "light");
        };
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    const setTheme = useCallback((t: Theme) => {
        setThemeState(t);
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
    }, []);

    const value = useMemo(
        () => ({ theme, setTheme, toggleTheme }),
        [theme, setTheme, toggleTheme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
