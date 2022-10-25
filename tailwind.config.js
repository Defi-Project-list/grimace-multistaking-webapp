/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')
const { colors } = require('./src/theme/colors')
const { fontWeight } = require('./src/theme/fontWeight')

module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",    
  ],
  theme: {
    extend: {},
  },
  plugins: [],  
}