/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          light: 'var(--canvas, #FFFFFF)',
          dark: 'var(--canvas, #0D1117)',
        },
        subtle: {
          light: 'var(--subtle, #F6F8FA)',
          dark: 'var(--subtle, #161B22)',
        },
        border: {
          light: 'var(--border, #E1E4E8)',
          dark: 'var(--border, #21262D)',
        },
        textPrimary: {
          light: 'var(--text-primary, #1F2328)',
          dark: 'var(--text-primary, #E6EDF3)',
        },
        textMuted: {
          light: 'var(--text-muted, #656D76)',
          dark: 'var(--text-muted, #8B949E)',
        },
        accentFocus: {
          light: 'var(--accent-focus, #0969DA)',
          dark: 'var(--accent-focus, #ea580c)',
        },
        codeBg: {
          light: 'var(--code-bg, #F6F8FA)',
          dark: 'var(--code-bg, #111620)',
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
