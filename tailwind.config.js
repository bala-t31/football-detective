/** @type {import('tailwindcss').Config} */
const rgb = (v) => `rgb(${v} / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Night pitch under floodlights
        pitch: {
          950: rgb('6 16 13'), // #06100D base
          900: rgb('10 24 19'),
          850: rgb('14 32 26'),
          800: rgb('19 41 33'),
          700: rgb('36 56 48'),
          600: rgb('52 74 65'),
        },
        // Turf mint: the single accent (correct answers, primary actions)
        lime: { DEFAULT: rgb('75 227 160'), dim: rgb('47 191 131'), soft: rgb('75 227 160') },
        ink: { DEFAULT: rgb('245 248 246'), muted: rgb('170 186 179'), faint: rgb('112 132 124') },
        ok: rgb('75 227 160'),
        warn: rgb('244 201 93'), // trophy gold — "close"
        bad: rgb('255 122 122'),
        flood: rgb('226 238 255'), // floodlight white-blue
      },
      fontFamily: {
        sans: ['"Geist Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque Variable"', '"Geist Variable"', 'ui-sans-serif', 'sans-serif'],
        // Numbers use the UI face with tabular figures; no monospace "terminal" look.
        mono: ['"Geist Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        glow: '0 0 0 1px rgb(75 227 160 / 0.35), 0 12px 40px -12px rgb(75 227 160 / 0.55)',
        card: 'inset 0 1px 0 rgb(255 255 255 / 0.14), 0 24px 60px -28px rgb(0 0 0 / 0.75)',
      },
      keyframes: {
        scan: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100%)' } },
        sheen: { '0%': { transform: 'translateX(-120%)' }, '60%, 100%': { transform: 'translateX(120%)' } },
        drift: { '0%, 100%': { transform: 'translate3d(0,0,0)' }, '50%': { transform: 'translate3d(2%,1.5%,0)' } },
      },
      animation: {
        scan: 'scan 3.5s linear infinite',
        sheen: 'sheen 4.5s ease-in-out infinite',
        drift: 'drift 18s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
