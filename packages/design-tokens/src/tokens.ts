export const colors = {
  light: {
    canvas: '#FFFFFF',
    subtle: '#F6F8FA',
    border: '#E1E4E8',
    textPrimary: '#1F2328',
    textMuted: '#656D76',
    accentFocus: '#0969DA',
    code: {
      canvas: '#F6F8FA',
      keyword: '#CF222E',
      string: '#0A3069',
      entity: '#8250DF',
      comment: '#6E7781',
    },
  },
  dark: {
    canvas: '#0D1117',
    subtle: '#161B22',
    border: '#21262D',
    textPrimary: '#E6EDF3',
    textMuted: '#8B949E',
    accentFocus: '#2F81F7',
    code: {
      canvas: '#111620',
      keyword: '#FF7B72',
      string: '#A5D6FF',
      entity: '#D2A8FF',
      comment: '#8B949E',
    },
  },
} as const;

export const typography = {
  fonts: {
    primary: 'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'Geist Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  scale: {
    title: { size: '2.000rem', weight: 600, lineHeight: 1.25, tracking: '-0.025em' },
    h2: { size: '1.500rem', weight: 600, lineHeight: 1.30, tracking: '-0.020em' },
    h3: { size: '1.125rem', weight: 600, lineHeight: 1.40, tracking: '-0.010em' },
    h4: { size: '0.938rem', weight: 600, lineHeight: 1.45, tracking: '0' },
    body: { size: '0.938rem', weight: 400, lineHeight: 1.65, tracking: '-0.005em' },
    nav: { size: '0.813rem', weight: 450, lineHeight: 1.40, tracking: '0' },
    codeBlock: { size: '0.813rem', weight: 400, lineHeight: 1.55, tracking: '-0.010em' },
    codeInline: { size: '0.813rem', weight: 500, lineHeight: 1.20, tracking: '0' },
  },
} as const;

export const motion = {
  micro: { duration: '150ms', easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  drawer: { duration: '200ms', easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
  spring: {
    treeReorder: { stiffness: 420, damping: 28 },
    dropdown: { stiffness: 500, damping: 32 },
  },
} as const;
