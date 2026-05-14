import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: '#0d0d0f',
        surface: '#16161a',
        'surface-2': '#1e1e24',
        'surface-3': '#26262e',
        border: '#2e2e38',
        primary: '#f5a623',
        'primary-dark': '#d4891a',
        accent: '#7c6bff',
        success: '#22c55e',
        danger: '#ef4444',
        warning: '#f59e0b',
        muted: '#6b7280',
        rarity: {
          consumer: '#b0c3d9',
          industrial: '#5e98d9',
          milspec: '#4b69ff',
          restricted: '#8847ff',
          classified: '#d32ce6',
          covert: '#eb4b4b',
          contraband: '#e4ae39',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'spin-case': 'spinCase 4s cubic-bezier(0.17, 0.67, 0.12, 0.99) forwards',
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        spinCase: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-4000px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
