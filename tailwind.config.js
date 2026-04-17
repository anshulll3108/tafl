/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: '#0F172A',
        'light-bg': '#F8FAFC',
        'electric-blue': '#3B82F6',
        'amber-token': '#F59E0B',
        'emerald': '#10B981',
        'rose': '#F43F5E',
        'purple-nt': '#8B5CF6',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
