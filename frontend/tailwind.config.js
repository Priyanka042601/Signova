/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        indigo: {
          brand: '#4338CA',
          light: '#6366F1',
          dark: '#3730A3',
          50: '#EEF2FF',
          100: '#E0E7FF',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        berry: {
          brand: '#BE185D',
          light: '#DB2777',
          dark: '#9D174D',
          50: '#FDF2F8',
          100: '#FCE7F3',
          700: '#BE185D',
          800: '#9D174D',
        },
        coral: {
          brand: '#FB7185',
          light: '#FDA4AF',
          dark: '#F43F5E',
          50: '#FFF1F2',
          100: '#FFE4E6',
          400: '#FB7185',
        },
        navy: {
          brand: '#1E293B',
          muted: '#64748B',
          border: '#E2E8F0',
        },
        cloud: '#F8FAFC',
        softrose: '#FFF1F2',
        sunshine: {
          brand: '#FBBF24',
          light: '#FCD34D',
          dark: '#D97706',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 14px 0 rgba(30, 41, 59, 0.05)',
        'card-hover': '0 8px 24px 0 rgba(67, 56, 202, 0.12)',
        'pop': '0 4px 0 0 rgba(55, 48, 163, 1)',
        'pop-berry': '0 4px 0 0 rgba(157, 23, 77, 1)',
        'pop-coral': '0 4px 0 0 rgba(225, 29, 72, 1)',
        'pop-sunshine': '0 4px 0 0 rgba(217, 119, 6, 1)',
      }
    },
  },
  plugins: [],
}
