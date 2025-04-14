/** @type {import('tailwindcss').Config} */
export default { // Note: Vite often uses ES Module syntax (export default)
  content: [
    "./index.html", // Include the main HTML file
    "./src/**/*.{js,ts,jsx,tsx}", // Include all JS/JSX/TS/TSX files in src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}