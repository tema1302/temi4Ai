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
        serif: ['Playfair Display', 'serif'], // Emotional, classic font
      },
      colors: {
        // Premium palette
        'obsidian': '#0a0a0b',
        'charcoal': '#121214',
        'gold': '#d4af37',
        'silk': '#f5f5f7',
      }
    },
  },
  plugins: [],
}
