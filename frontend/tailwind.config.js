/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        savora: {
          brown: '#664930',
          taupe: '#997E67',
          beige: '#CCBEB1',
          peach: '#FFDBBB',
          card: '#F8F4F0',
          text: {
            primary: '#2B2B2B',
            secondary: '#6B6B6B'
          },
          border: '#E8E1DA',
          success: '#3B7A57',
          error: '#B54B4B',
          warning: '#D78A2C',
          info: '#4F6D7A'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif']
      }
    },
  },
  plugins: [],
}
