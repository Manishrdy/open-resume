"use client";

import { useThemeContext } from "./ThemeProvider";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export const ThemeToggle = () => {
    const { theme, toggleTheme, mounted } = useThemeContext();

    // Prevent rendering until mounted to avoid hydration mismatch
    if (!mounted) {
        return (
            <div className="h-10 w-10 rounded-md" aria-hidden="true" />
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 focus-visible:bg-gray-100 dark:text-dark-fg-muted dark:hover:bg-dark-bg-tertiary dark:focus-visible:bg-dark-bg-tertiary"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
            {theme === "light" ? (
                <MoonIcon className="h-6 w-6" />
            ) : (
                <SunIcon className="h-6 w-6" />
            )}
        </button>
    );
};
