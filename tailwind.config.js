/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        emerald: {
          DEFAULT: '#10b981',
          deep: '#022c22',
        },
        gold: {
          bright: '#ffcc33',
          metal: '#b45309',
        },
      },
    },
  },
  plugins: [],
}
