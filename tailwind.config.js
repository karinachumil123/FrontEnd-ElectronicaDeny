/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        VerdeOscuro: "#0C5E01", 
        Verde: "#118501",
        limon: "#2FB201",
        VerdeClaro: "#50CF01",
        Negro: "#000000ff",
      },
    },
  },
  plugins: [],
}
