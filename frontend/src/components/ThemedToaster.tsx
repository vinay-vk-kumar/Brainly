import { Toaster } from "react-hot-toast";
import { useTheme } from "../context/ThemeProvider";

export function ThemedToaster() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: isDark ? "rgb(31 41 55)" : "rgb(255 255 255)",
                    color: isDark ? "rgb(243 244 246)" : "rgb(17 24 39)",
                    border: isDark ? "1px solid rgb(55 65 81)" : "1px solid rgb(229 231 235)",
                    boxShadow: isDark
                        ? "0 18px 50px -12px rgba(0,0,0,0.45)"
                        : "0 18px 50px -12px rgba(15, 23, 42, 0.12)",
                    borderRadius: "12px",
                    padding: "12px 14px",
                },
            }}
        />
    );
}
