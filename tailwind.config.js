/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary brand — crisp violet-indigo (Linear-inspired)
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6' /* Vivid violet */,
          600: '#7c3aed' /* Primary action */,
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#1e1b4b' /* Deep indigo-black */,
          950: '#0d0b2e',
        },
        // Zinc uses Tailwind defaults — no override needed
        // Semantic status
        success: {
          light: '#d1fae5',
          DEFAULT: '#10b981',
          dark: '#065f46',
        },
        warning: {
          light: '#fef3c7',
          DEFAULT: '#f59e0b',
          dark: '#92400e',
        },
        error: {
          light: '#fee2e2',
          DEFAULT: '#ef4444',
          dark: '#7f1d1d',
        },
        info: {
          light: '#dbeafe',
          DEFAULT: '#3b82f6',
          dark: '#1e3a8a',
        },
      },

      fontFamily: {
        sans: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      boxShadow: {
        // Subtle, precise — Linear-style
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        soft: '0 4px 24px -2px rgb(0 0 0 / 0.06), 0 2px 8px -2px rgb(0 0 0 / 0.04)',
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        hover: '0 8px 32px -4px rgb(0 0 0 / 0.10), 0 4px 12px -4px rgb(0 0 0 / 0.06)',
        modal: '0 24px 64px -12px rgb(0 0 0 / 0.18)',
        // Glow variants
        glow: '0 0 20px rgba(124, 58, 237, 0.35)',
        'glow-lg': '0 0 40px rgba(124, 58, 237, 0.25), 0 0 80px rgba(124, 58, 237, 0.12)',
        'glow-brand': '0 0 24px rgba(124, 58, 237, 0.3), 0 0 48px rgba(124, 58, 237, 0.1)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.35)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.3)',
        // Portal
        'portal-card': '0 1px 2px 0 rgb(0 0 0 / 0.03), 0 1px 3px -1px rgb(0 0 0 / 0.02)',
        'portal-hover': '0 4px 16px -2px rgb(0 0 0 / 0.06), 0 2px 6px -2px rgb(0 0 0 / 0.03)',
        // Inner
        'inner-soft': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.04)',
      },

      backgroundImage: {
        // Gradient presets
        'gradient-brand': 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)',
        'gradient-brand-h': 'linear-gradient(90deg, #7c3aed 0%, #6d28d9 100%)',
        'gradient-dark': 'linear-gradient(135deg, #09090b 0%, #18181b 100%)',
        'gradient-mesh': `
          radial-gradient(at 0% 0%,   rgba(124, 58, 237, 0.12) 0px, transparent 50%),
          radial-gradient(at 100% 0%, rgba(167, 139, 250, 0.08) 0px, transparent 50%),
          radial-gradient(at 50% 100%, rgba(6, 182, 212, 0.06)  0px, transparent 50%)
        `,
        'grid-subtle': `
          linear-gradient(rgba(100,100,100,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(100,100,100,0.04) 1px, transparent 1px)
        `,
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise-subtle': `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E")`,
      },

      backgroundSize: {
        grid: '40px 40px',
      },

      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-right': 'slideRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'blur-in': 'blurIn 0.4s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 1.8s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounceSoft 1s infinite',
        'gradient-pan': 'gradientPan 4s ease infinite alternate',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.93)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        blurIn: {
          '0%': { opacity: '0', filter: 'blur(8px)' },
          '100%': { opacity: '1', filter: 'blur(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        bounceSoft: {
          '0%, 100%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(-8px)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        gradientPan: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
      },

      transitionTimingFunction: {
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-in': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      transitionDuration: {
        '400': '400ms',
      },

      backdropBlur: {
        '2xl': '40px',
        '3xl': '64px',
      },

      spacing: {
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
      },
    },
  },
  plugins: [
    // WebKit scrollbar styles are in index.css (global).
    // This plugin provides .scrollbar-thin for explicit opt-in (Firefox support).
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': '#3f3f46 #09090b',
        },
      });
    },
  ],
};
