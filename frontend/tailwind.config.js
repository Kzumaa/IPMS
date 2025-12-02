/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#3a65e9", // Unifying around a core blue
                "primary-dark": "#1e40af",
                "background-light": "#f6f6f8",
                "background-dark": "#111521",
            },
            fontFamily: {
                display: ["Inter", "sans-serif"],
                public: ["Public Sans", "sans-serif"],
            },
        },
    },
    plugins: [],
}
