import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          light: '#FFFFFF',
          dark: '#0D1117',
        },
        subtle: {
          light: '#F6F8FA',
          dark: '#161B22',
        },
        border: {
          light: '#E1E4E8',
          dark: '#21262D',
        },
        textPrimary: {
          light: '#1F2328',
          dark: '#E6EDF3',
        },
        textMuted: {
          light: '#656D76',
          dark: '#8B949E',
        },
        accentFocus: {
          light: '#0969DA',
          dark: '#2F81F7',
        },
      },
      fontFamily: {
        sans: ['Geist', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
