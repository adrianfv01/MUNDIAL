/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '480px',
      },
      colors: {
        campo: {
          50: '#E9F6EE',
          100: '#C9EAD3',
          200: '#90D3A6',
          300: '#56BC79',
          400: '#2EA259',
          500: '#0E7C3A',
          600: '#0B6630',
          700: '#085026',
          800: '#063B1C',
          900: '#042612',
        },
        trofeo: {
          50: '#FFF8E5',
          100: '#FCEBB6',
          200: '#F8D97C',
          300: '#F2C14E',
          400: '#E0A92E',
          500: '#B98818',
          600: '#8E6710',
        },
        rojo: {
          DEFAULT: '#C8102E',
          oscuro: '#8E0B20',
        },
        celeste: {
          DEFAULT: '#3FBDF1',
          oscuro: '#1A8FBE',
        },
        crema: '#F7F4EC',
        carbon: '#0B0B0B',
      },
      fontFamily: {
        display: ['Anton', 'Bebas Neue', 'Impact', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hex-pattern':
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='52' viewBox='0 0 60 52'><path d='M30 0L60 17v18L30 52L0 35V17z' fill='none' stroke='%23ffffff' stroke-opacity='0.05' stroke-width='1'/></svg>\")",
        'foil-gradient':
          'conic-gradient(from 0deg, #f2c14e, #ff6b9d, #3fbdf1, #56bc79, #f2c14e)',
      },
      boxShadow: {
        estampa: '0 6px 18px -8px rgba(0,0,0,0.35), 0 2px 6px -2px rgba(0,0,0,0.2)',
        foil: '0 0 24px rgba(242, 193, 78, 0.45)',
      },
      animation: {
        'foil-shift': 'foilShift 8s ease-in-out infinite',
        'pop-in': 'popIn 220ms ease-out',
        'shine': 'shine 2.4s linear infinite',
      },
      keyframes: {
        foilShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        popIn: {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '60%': { transform: 'scale(1.06)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shine: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
    },
  },
  plugins: [],
}
