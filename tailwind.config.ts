import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* DS palette */
        navy: { 950: '#011C38', 900: '#012C57', 800: '#0A3A68', 700: '#1B4C7A', 500: '#4A749B', 300: '#9DB4C9', 200: '#C7D5E1', 50: '#EDF1F6' },
        blue: { 600: '#0069BE', 500: '#0080E3', 100: '#D6EBFA' },
        brass: { 700: '#8C6224', 600: '#A8762E', 500: '#C89F5D', 200: '#E8D8B8', 50: '#F6EEDC' },
        terracotta: { 700: '#96413A', 600: '#A8483C', 500: '#B85C50', 100: '#F1DFDB' },
        sand: { 50: '#FDFCFA', 100: '#FAF8F5', 200: '#F4F0EA', 300: '#EBE6DE', 400: '#DBD3C7', 500: '#B9B0A2' },
        ink: { 900: '#1A1D24', 700: '#3C4351', 500: '#5A6478', 400: '#7C8698' },
        /* Legacy aliases — keep until all pages migrated */
        teal: { DEFAULT: "#012C57", dark: "#011C38", light: "#EDF1F6" },
        cream: "#FAF8F5",
      },
      fontFamily: {
        display: ['"Source Serif 4"', '"Iowan Old Style"', 'Georgia', 'serif'],
        sans: ['Figtree', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        /* legacy alias */
        serif: ['"Source Serif 4"', '"Iowan Old Style"', 'Georgia', 'serif'],
      },
      fontSize: {
        'display-1': ['4.5rem', { lineHeight: '1.04', letterSpacing: '-0.02em' }],
        'display-2': ['3.5rem', { lineHeight: '1.14', letterSpacing: '-0.02em' }],
        'display-3': ['2.5rem', { lineHeight: '1.14', letterSpacing: '-0.02em' }],
        'display-4': ['1.75rem', { lineHeight: '1.28', letterSpacing: '-0.02em' }],
        title: ['1.375rem', { lineHeight: '1.28' }],
        lead: ['1.25rem', { lineHeight: '1.55' }],
        'body-lg': ['1.125rem', { lineHeight: '1.72' }],
        body: ['1rem', { lineHeight: '1.6' }],
        sm: ['0.875rem', { lineHeight: '1.45' }],
        xs: ['0.8125rem', { lineHeight: '1.5' }],
        label: ['0.6875rem', { lineHeight: '1.2', letterSpacing: '0.09em' }],
      },
      spacing: {
        1: '2px', 2: '4px', 3: '8px', 4: '12px', 5: '16px',
        6: '24px', 7: '32px', 8: '48px', 9: '64px', 10: '96px', 11: '128px',
      },
      borderRadius: {
        none: '0', xs: '2px', sm: '3px', md: '4px', pill: '999px',
      },
      boxShadow: {
        lift: '0 1px 2px rgba(1,44,87,.05), 0 4px 12px rgba(1,44,87,.06)',
      },
      maxWidth: {
        container: '1200px', wide: '1440px', narrow: '760px', prose: '68ch',
      },
      transitionDuration: { fast: '120ms', base: '180ms', slow: '260ms' },
      transitionTimingFunction: { out: 'cubic-bezier(.2,.6,.2,1)' },
    },
  },
  plugins: [],
};

export default config;
