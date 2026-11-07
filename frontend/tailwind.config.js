/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Blue Identity (replaces violet/indigo with rich cobalt & royal blue)
        indigo: {
          brand: '#2563EB',
          light: '#3B82F6',
          dark: '#1D4ED8',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },
        // Secondary Blue / Sky Accent (replaces magenta berry with bright ocean cyan & sky blue)
        berry: {
          brand: '#0284C7',
          light: '#0EA5E9',
          dark: '#0369A1',
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        // Cyan / Teal Electric Blue (replaces pink coral)
        coral: {
          brand: '#0891B2',
          light: '#06B6D4',
          dark: '#0E7490',
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          700: '#0E7490',
        },
        navy: {
          brand: '#0F172A',
          muted: '#64748B',
          border: '#E2E8F0',
          dark: '#0B0F19',
        },
        cloud: '#F8FAFC',
        softrose: '#F0F9FF',
        sunshine: {
          brand: '#F59E0B',
          light: '#FCD34D',
          dark: '#D97706',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 14px 0 rgba(15, 23, 42, 0.05)',
        'card-dark': '0 4px 20px 0 rgba(2, 6, 23, 0.45)',
        'card-hover': '0 8px 24px 0 rgba(37, 99, 235, 0.12)',
        'card-hover-dark': '0 8px 28px 0 rgba(59, 130, 246, 0.2)',
        'pop': '0 4px 0 0 #1D4ED8',
        'pop-berry': '0 4px 0 0 #0369A1',
        'pop-coral': '0 4px 0 0 #0E7490',
        'pop-sunshine': '0 4px 0 0 #D97706',
        'glow-blue': '0 0 25px -4px rgba(37, 99, 235, 0.35)',
      }
    },
  },
  plugins: [],
}
