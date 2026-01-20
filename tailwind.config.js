/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        farmacia: '#059669',
        'farmacia-dark': '#047857',
        naranja: '#f97316',
      },
    },
  },
  plugins: [],
}
