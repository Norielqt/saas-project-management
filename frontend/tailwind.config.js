/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e6f0f4',
          100: '#cce1e9',
          200: '#99c3d3',
          300: '#66a5bd',
          400: '#3387a7',
          500: '#005a7a',
          600: '#004560',
          700: '#003a52',
          800: '#003148',
          900: '#001f2e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
