/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                bitter: ['Bitter', 'serif'],
                dancing: ["'Dancing Script'", 'cursive'], 
            },
        },
    },
    plugins: [],
};
