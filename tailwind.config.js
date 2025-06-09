/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6200E2",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F9FAFB",
          foreground: "#6B7280",
        },
        destructive: {
          DEFAULT: "#FF5907",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#FFEEEA",
        },
        background: "#FFFFFF",
        border: "#EDEEF0",
        input: "#E5E7EB",
        ring: "#6200E2",
      },
    },
  },
  plugins: [],
} 