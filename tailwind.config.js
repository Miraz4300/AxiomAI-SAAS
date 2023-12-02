/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    fontFamily: {
      logo: ['Consolas', 'sans-serif'],
      header: ['Arial', 'sans-serif'],
    },
    extend: {
      animation: {
        blink: 'blink 1.2s infinite steps(1, start)',
      },
      backgroundImage: {
        'brand-logo': 'url(\'/favicon.png\')',
      },
      keyframes: {
        blink: {
          '0%, 100%': { 'background-color': 'currentColor' },
          '50%': { 'background-color': 'transparent' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
