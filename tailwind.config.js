/** @type {import('tailwindcss').Config} */
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,ts,tsx}",
  ],
  darkMode: 'class', 
  theme: {
    extend: {},
  },
  plugins: [
    forms,
    typography,
  ],
}
