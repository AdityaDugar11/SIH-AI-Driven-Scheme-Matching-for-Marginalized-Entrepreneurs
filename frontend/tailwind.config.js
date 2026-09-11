/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F52BA', // Sapphire Blue
        secondary: '#2E8B57', // Sea Green
        warning: '#D32F2F', // Red
        background: '#F9FAFB', // Off-white
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
