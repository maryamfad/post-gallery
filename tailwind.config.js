/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        customBlue: '#7796CB',
        customRed: '#abcdef',
        customGray: '#dad8d7',
      },
    },
  },

  plugins: [],
}

