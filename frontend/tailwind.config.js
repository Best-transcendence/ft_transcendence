module.exports = {
  content: ["./public/**/*.html", "./src/**/*.{ts,js}"],
  theme: {
    extend: {
      colors: {
        'theme-bg1': 'var(--color-bg-1)',
        'theme-bg2': 'var(--color-bg-2)',
        'theme-accent1': 'var(--color-accent-1)',
        'theme-accent2': 'var(--color-accent-2)',
        'theme-text': 'var(--color-text)',
        'theme-button': 'var(--color-button)',
        'theme-button-hover': 'var(--color-button-hover)',

        brand: {
          light: 'var(--color-brand-light)',
          DEFAULT: 'var(--color-brand)',
          dark: 'var(--color-brand-dark)',
        },
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
