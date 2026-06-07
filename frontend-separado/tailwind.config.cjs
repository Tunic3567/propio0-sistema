module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        // Paleta minimalista neutra (claro y oscuro)
        exec: {
          surface: '#fafafa',
          'surface-dark': '#0a0a0a',
          border: '#e5e5e5',
          'border-dark': '#262626',
          muted: '#737373',
          'muted-dark': '#a3a3a3',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'exec': '0 1px 2px rgb(0 0 0 / 0.04)',
        'exec-md': '0 2px 4px rgb(0 0 0 / 0.04)',
        'exec-lg': '0 4px 8px rgb(0 0 0 / 0.04)',
      },
    },
  },
  plugins: [],
}
