/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43', // Deep Sapphire Blue
          DEFAULT: '#102a43'
        },
        secondary: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d', // Soft Emerald
          DEFAULT: '#16a34a'
        },
        surface: '#ffffff',
        background: '#f8fafc',
        alert: {
          amber: '#f59e0b',
          red: '#ef4444'
        }
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(16, 42, 67, 0.1)',
        'premium-hover': '0 20px 40px -15px rgba(16, 42, 67, 0.15)',
        'glass': '0 8px 32px 0 rgba(16, 42, 67, 0.05)',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
