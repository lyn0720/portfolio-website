import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Dual-theme palette driven by CSS variables (green default / violet avatar theme)
        jungle: {
          50: "rgb(var(--jungle-50) / <alpha-value>)",
          100: "rgb(var(--jungle-100) / <alpha-value>)",
          200: "rgb(var(--jungle-200) / <alpha-value>)",
          300: "rgb(var(--jungle-300) / <alpha-value>)",
          400: "rgb(var(--jungle-400) / <alpha-value>)",
          500: "rgb(var(--jungle-500) / <alpha-value>)",
          600: "rgb(var(--jungle-600) / <alpha-value>)",
          700: "rgb(var(--jungle-700) / <alpha-value>)",
          800: "rgb(var(--jungle-800) / <alpha-value>)",
          900: "rgb(var(--jungle-900) / <alpha-value>)",
          950: "rgb(var(--jungle-950) / <alpha-value>)",
        },
        honey: {
          50: "rgb(var(--honey-50) / <alpha-value>)",
          100: "rgb(var(--honey-100) / <alpha-value>)",
          200: "rgb(var(--honey-200) / <alpha-value>)",
          300: "rgb(var(--honey-300) / <alpha-value>)",
          400: "rgb(var(--honey-400) / <alpha-value>)",
          500: "rgb(var(--honey-500) / <alpha-value>)",
          600: "rgb(var(--honey-600) / <alpha-value>)",
          700: "rgb(var(--honey-700) / <alpha-value>)",
          800: "rgb(var(--honey-800) / <alpha-value>)",
          900: "rgb(var(--honey-900) / <alpha-value>)",
          950: "rgb(var(--honey-950) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        sway: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
        sway: "sway 6s ease-in-out infinite",
      },
      backgroundImage: {
        "jungle-gradient": "linear-gradient(to bottom, rgb(var(--grad-from)), rgb(var(--grad-mid)), rgb(var(--grad-to)))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
