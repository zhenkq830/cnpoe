/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        poe: {
          dark: '#08080f',
          darker: '#04040a',
          panel: '#101018',
          card: '#181825',
          border: '#2a2a3a',
          gold: '#af8c4b',
          'gold-light': '#c9a85b',
          'gold-dark': '#8a6a32',
          text: '#d4d4cc',
          muted: '#7a7a8a',
          accent: '#e85d2c',
          green: '#3a9b5a',
          yellow: '#c9a020',
          red: '#d43838',
          blue: '#4a7dbf',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
