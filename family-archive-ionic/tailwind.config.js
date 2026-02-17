/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        'obsidian': '#1a1a23',
        'charcoal': '#24242d',
        'gold': '#d4af37',
        'silk': '#f5f5f7',
      }
    },
  },
  plugins: [],
}
