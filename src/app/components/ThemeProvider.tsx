"use client";

import { createContext, useContext, ReactNode } from "react";
import { useTheme, type Theme } from "lib/hooks/useTheme";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const themeState = useTheme();

    return (
        <ThemeContext.Provider value={themeState}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useThemeContext must be used within ThemeProvider");
    }
    return context;
};
