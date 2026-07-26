/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hacar: {
          green: '#36563D',
          darkGreen: '#2a4330',
          yellow: '#F2C633',
          bg: '#E5E0D9',
          dark: '#1D252C',
          red: '#FE615A',
          success: '#3EC55F'
        }
      }
    },
  },
  plugins: [],
}
