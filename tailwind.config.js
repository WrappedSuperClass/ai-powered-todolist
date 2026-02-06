module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'now': {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          950: '#450a0a',
        },
        'soon': {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fdd835',
          400: '#facc15',
          500: '#eab308',
          950: '#422006',
        },
        'chill': {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#10b981',
          500: '#059669',
          950: '#064e3b',
        },
        pastel: {
          bg: '#fdf4ff',
          card: '#ffffff',
          border: '#e2e8f0',
        }
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};