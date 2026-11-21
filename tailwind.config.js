/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pitch: {
          950: '#0B0D0C',
          900: '#121613',
          850: '#171C18',
          800: '#1D231E',
          700: '#272D28',
          600: '#343C35',
        },
        lime: { DEFAULT: '#B7FF35', soft: '#B7FF3522', dim: '#8BC424' },
        ink: { DEFAULT: '#F4F6F3', muted: '#929B93', faint: '#5F6860' },
        ok: '#4ADE80',
        warn: '#FACC15',
        bad: '#F87171',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px #B7FF3533, 0 8px 40px -12px #B7FF3555',
        card: '0 1px 0 0 #ffffff08 inset, 0 12px 32px -16px #00000099',
      },
      keyframes: {
        scan: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100%)' } },
      },
      animation: { scan: 'scan 3.5s linear infinite' },
    },
  },
  plugins: [],
};
