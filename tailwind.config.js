/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{ts,tsx,mdx}"],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        dot: "url('/assets/dots.svg')",
      },
      colors: {
        // Professional Dark - Modern SaaS inspired palette
        dark: {
          bg: '#1a1a1a',              // Warm near-black base
          'bg-secondary': '#242424',   // Cards and panels
          'bg-tertiary': '#2d2d2d',    // Hover states
          fg: '#e8e8e8',              // High contrast text
          'fg-muted': '#a0a0a0',      // Secondary text
          'fg-subtle': '#6b6b6b',     // Disabled/tertiary text
          border: '#3a3a3a',          // Visible borders
          'border-subtle': '#2d2d2d', // Very subtle dividers
        },
        light: {
          bg: '#ffffff',
          'bg-secondary': '#f9fafb',
          'bg-tertiary': '#f3f4f6',
          fg: '#111827',
          'fg-muted': '#6b7280',
          'fg-subtle': '#9ca3af',
          border: '#e5e7eb',
          'border-subtle': '#f3f4f6',
        },
      },
    },
  },
  corePlugins: {
    aspectRatio: false,
  },
  plugins: [
    require("tailwind-scrollbar")({ nocompatible: true }),
    require("@tailwindcss/aspect-ratio"),
  ],
};
