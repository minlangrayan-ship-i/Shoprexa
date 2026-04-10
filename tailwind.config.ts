import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefaf6',
          100: '#d5f3e8',
          500: '#12b981',
          600: '#0d9769',
          700: '#0b7855'
        },
        accent: '#f97316',
        dark: '#0b1220'
      },
      boxShadow: {
        soft: '0 8px 32px rgba(11,18,32,0.08)'
      }
    }
  },
  plugins: []
} satisfies Config;
