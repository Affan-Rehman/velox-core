/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Obsidian SaaS Palette - Deep, rich, premium
        velox: {
          void: '#08090c',        // Deepest black
          abyss: '#0d0f14',       // Primary background
          obsidian: '#12151c',    // Card background
          slate: '#1a1e28',       // Elevated surfaces
          graphite: '#252a38',    // Borders, dividers
          steel: '#3d4556',       // Muted text
          silver: '#6b7280',      // Secondary text
          pearl: '#9ca3af',       // Tertiary text
          ivory: '#d1d5db',       // Primary text
          snow: '#f3f4f6',        // Bright text
          white: '#ffffff',       // Maximum contrast
        },
        accent: {
          primary: '#6366f1',     // Indigo - primary actions
          secondary: '#8b5cf6',   // Violet - secondary
          tertiary: '#a855f7',    // Purple - highlights
          success: '#10b981',     // Emerald - success states
          warning: '#f59e0b',     // Amber - warnings
          danger: '#ef4444',      // Red - errors
          info: '#3b82f6',        // Blue - info
          cyan: '#06b6d4',        // Cyan - special
        },
        glow: {
          primary: 'rgba(99, 102, 241, 0.4)',
          success: 'rgba(16, 185, 129, 0.4)',
          danger: 'rgba(239, 68, 68, 0.4)',
        }
      },
      fontFamily: {
        display: ['Cabinet Grotesk', 'system-ui', 'sans-serif'],
        body: ['Satoshi', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': '0.625rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)' },
          '100%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.4)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(99, 102, 241, 0.3)',
        'glow-md': '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(99, 102, 241, 0.1)',
      },
    },
  },
  plugins: [],
};

