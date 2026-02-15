/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'smit-green': '#66b032',
        'smit-blue': '#0057a8',
        'dark-bg': '#111827',
        'indigo': {
          600: '#4f46e5',
        },
        'purple': {
          600: '#9333ea',
        }
      },
      boxShadow: {
        'neon': '0 0 20px rgba(99, 102, 241, 0.5)',
      }
    },
  },
  plugins: [],
}