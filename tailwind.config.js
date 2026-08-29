/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      colors: {
        navy: {
          50: "#EEF2FA",
          100: "#D9E2F5",
          400: "#3E5C99",
          600: "#1B3A73",
          700: "#122B5C",
          800: "#0D2049",
          900: "#0A1833",
          950: "#071224",
        },
        brand: {
          50: "#EBF1FF",
          100: "#D6E3FF",
          200: "#AEC6FF",
          400: "#3D6BF0",
          500: "#2454E6",
          600: "#1A42CE",
          700: "#1533A3",
        },
        risk: {
          low: "#158A4A",
          lowBg: "#E7F7EE",
          lowBorder: "#B8E9CD",
          medium: "#B26A00",
          mediumBg: "#FFF4DE",
          mediumBorder: "#FBDA9E",
          high: "#C22626",
          highBg: "#FDECEC",
          highBorder: "#F5BFBF",
        },
        saffron: "#FF9933",
        indiagreen: "#128A3E",
        surface: "#FFFFFF",
        canvas: "#F3F6FB",
        ink: {
          900: "#0F1A2E",
          700: "#33415C",
          500: "#5B6B88",
          400: "#8492AB",
          200: "#DBE2ED",
          100: "#EBEFF5",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,26,46,0.04), 0 4px 16px rgba(15,26,46,0.06)",
        cardHover: "0 8px 28px rgba(15,26,46,0.12)",
        panel: "0 2px 8px rgba(15,26,46,0.06)",
      },
      borderRadius: {
        xl2: "1.1rem",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(14px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.6s ease forwards",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};
