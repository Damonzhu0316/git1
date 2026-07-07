/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      screens: {
        'xs': '480px',
        'mobile': { 'max': '767px' },
      },
    },
  },
  plugins: [],
};