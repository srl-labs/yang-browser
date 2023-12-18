/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'nokia-blue': '#005AFF',
        'nokia-blue-black': '#001135',
        'nokia-old-blue': 'rgb(18, 65, 145)',
        'nokia-yellow': '#F7B737',
        'nokia-orange': '#F47F31',
        'nokia-red': '#E23B3B'
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