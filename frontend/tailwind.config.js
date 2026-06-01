/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#b3c7ff',
          400: '#85a4ff',
          500: '#4f75ff', // Harmonious tailored indigo blue
          600: '#2b4eff',
          700: '#1536eb',
          800: '#102bb8',
          900: '#132891',
        }
      }
    },
  },
  plugins: [],
}
