/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kitovu': {
          purple: '#7A2F99',
          green: '#4CAF50',
          pink: '#FF4081',
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}