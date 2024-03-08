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
        gradient: 'gradient 1.5s linear',
      },
      backgroundImage: {
        'brand-logo': 'url(\'/axiomai-logomark.png\')',
      },
      keyframes: {
        gradient: {
          to: { 'background-position': '-200% center' },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      })
    },
  ],
}
