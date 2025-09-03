module.exports = {
  content: ["./public/**/*.html", "./src/**/*.{ts, js}"],
  theme: {
    extend: {
      theme: {
        bg1: "var(--color-bg-1)",
        bg2: "var(--color-bg-2)",
        accent1: "var(--color-accent-1)",
        accent2: "var(--color-accent-2)",
        text: "var(--color-text)",
        button: "var(--color-button)",
        buttonHover: "var(--color-button-hover)",
      },
      colors: {
        brand: {
          light: "var(--color-brand-light)",
          DEFAULT: "var(--color-brand)",
          dark: "var(--color-brand-dark",
        },
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};