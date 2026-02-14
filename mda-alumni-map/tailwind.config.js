/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mda-blue': '#1a365d', // Deep blue
        'mda-gold': '#d4af37', // Gold for ranks
      }
    },
  },
  plugins: [],
}
