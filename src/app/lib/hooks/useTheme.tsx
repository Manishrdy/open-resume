"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "open-resume-theme";

export const useTheme = () => {
    const [theme, setTheme] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Get theme from localStorage or system preference
        const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;

        if (storedTheme) {
            setTheme(storedTheme);
            applyTheme(storedTheme);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            const systemTheme = prefersDark ? "dark" : "light";
            setTheme(systemTheme);
            applyTheme(systemTheme);
        }
    }, []);

    const applyTheme = (newTheme: Theme) => {
        const root = document.documentElement;
        if (newTheme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    };

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        applyTheme(newTheme);
    };

    return { theme, toggleTheme, mounted };
};
