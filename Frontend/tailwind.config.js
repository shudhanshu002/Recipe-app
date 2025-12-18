/* eslint-env node */
/* eslint-disable no-undef */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Bitter', 'serif'],
        dancing: ['Dancing Script', 'cursive'],
      },
      colors: {
        primary: '#f97316',
        secondary: '#fff7ed',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
