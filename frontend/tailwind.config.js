/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        violet: {
          50: '#f1eeff',
          100: '#e6e1ff',
          200: '#d2cbff',
          300: '#b7acff',
          400: '#9c8cff',
          500: '#8470ff',
          600: '#755ff8',
          700: '#5d47de',
          800: '#4634b1',
          900: '#2f227c',
          950: '#1c1357',
        },
      },
      screens: {
        xs: '480px',
      },
    },
  },
  plugins: [],
}
