import { fontFamily } from "@tailwindcss/defaultTheme"

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/page.{js,ts,jsx,tsx}",
        "./app/**/components/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        screens: {
            sm: "576px",
            md: "960px",
            lg: "1024px",
            xl: "1280px",
            "2xl": "1728px",
        },
        container: {
            DEFAULT: "1rem",
            sm: "2rem",
            lg: "4rem",
            xl: "5rem",
            "2xl": "6rem",
        },
    },
    daisyui: {
        themes: [
            {
                metaslot: {
                    primary: "#010038",
                    secondary: "#373366",
                    accent: "#D24B63",
                    neutral: "#2a323c",
                    "base-100": "#191643",
                    info: "#3abff8",
                    success: "#36d399",
                    warning: "#616161",
                    error: "#f87272",
                },
            },
        ],
    },
    plugins: [require("@tailwindcss/typography"), require("daisyui")],
}
