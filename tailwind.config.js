/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        sidebar: {
          bg:     '#0f172a',
          hover:  '#1e293b',
          active: '#1e293b',
          border: '#1e293b',
        },
        // Profile module — navy design system
        navy: {
          50:  '#f0f3fa',
          100: '#dde4f3',
          200: '#b8caec',
          300: '#8aa5da',
          400: '#5c7fc5',
          500: '#3860b0',
          600: '#243B6B',
          700: '#1c2e55',
          800: '#152240',
          900: '#0e172b',
          950: '#070c18',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.07)',
        'card-lg': '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)',
      },
    },
  },
  plugins: [],
}
