/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'nokia-blue': '#005AFF',
        'nokia-blue-black': '#001135',
        'nokia-old-blue': 'rgb(18, 65, 145)'
      }
    },
    fontFamily: {
      nunito: ['Nunito', 'sans-serif'],
      fira: ['Fira Code', 'monospace'],
      "nokia-headline": ['NokiaPureHeadline', 'sans-serif'],
      "nokia-headline-light": ['NokiaPureHeadlineLight', 'sans-serif'],
    }
  },
  plugins: [],
}
