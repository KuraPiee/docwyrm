export type ThemeId =
  | 'default'
  | 'tokyo-night'
  | 'nordic-frost'
  | 'emerald-obsidian'
  | 'retro-crt'
  | 'geist-minimal'
  | 'cyber-sunset';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  author: string;
  authorUrl: string;
  colors: {
    canvas: string;
    subtle: string;
    border: string;
    textPrimary: string;
    textMuted: string;
    accentFocus: string;
    codeBg: string;
  };
  fontFamily?: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  default: {
    id: 'default',
    name: 'Docwyrm Classic',
    author: 'Docwyrm Team',
    authorUrl: 'https://github.com/KuraPiee',
    colors: {
      canvas: '#0D1117',
      subtle: '#161B22',
      border: '#21262D',
      textPrimary: '#E6EDF3',
      textMuted: '#8B949E',
      accentFocus: '#ea580c',
      codeBg: '#111620',
    },
  },
  'tokyo-night': {
    id: 'tokyo-night',
    name: 'Tokyo Midnight',
    author: 'Docwyrm Team (@KuraPiee)',
    authorUrl: 'https://github.com/KuraPiee',
    colors: {
      canvas: '#1a1b26',
      subtle: '#24283b',
      border: '#3b4261',
      textPrimary: '#c0caf5',
      textMuted: '#7aa2f7',
      accentFocus: '#bb9af7',
      codeBg: '#16161e',
    },
  },
  'nordic-frost': {
    id: 'nordic-frost',
    name: 'Nordic Frost',
    author: 'Docwyrm Team',
    authorUrl: 'https://github.com/KuraPiee',
    colors: {
      canvas: '#2e3440',
      subtle: '#3b4252',
      border: '#4c566a',
      textPrimary: '#eceff4',
      textMuted: '#88c0d0',
      accentFocus: '#81a1c1',
      codeBg: '#242933',
    },
  },
  'emerald-obsidian': {
    id: 'emerald-obsidian',
    name: 'Emerald Obsidian',
    author: 'Docwyrm Team',
    authorUrl: 'https://github.com/KuraPiee',
    colors: {
      canvas: '#09130e',
      subtle: '#0f291e',
      border: '#1b4d38',
      textPrimary: '#ecfdf5',
      textMuted: '#6ee7b7',
      accentFocus: '#10b981',
      codeBg: '#050e08',
    },
  },
  'retro-crt': {
    id: 'retro-crt',
    name: 'Retro Terminal (Amber CRT)',
    author: 'Docwyrm Team',
    authorUrl: 'https://github.com/KuraPiee',
    colors: {
      canvas: '#0c0a09',
      subtle: '#1c1917',
      border: '#78350f',
      textPrimary: '#fbbf24',
      textMuted: '#d97706',
      accentFocus: '#f59e0b',
      codeBg: '#000000',
    },
    fontFamily: '"Geist Mono", monospace',
  },
  'geist-minimal': {
    id: 'geist-minimal',
    name: 'Geist Minimalist',
    author: 'Docwyrm Team',
    authorUrl: 'https://github.com/KuraPiee',
    colors: {
      canvas: '#000000',
      subtle: '#111111',
      border: '#2e2e2e',
      textPrimary: '#ffffff',
      textMuted: '#888888',
      accentFocus: '#ffffff',
      codeBg: '#0a0a0a',
    },
  },
  'cyber-sunset': {
    id: 'cyber-sunset',
    name: 'Sunset Vaporwave',
    author: 'Docwyrm Team',
    authorUrl: 'https://github.com/KuraPiee',
    colors: {
      canvas: '#18122B',
      subtle: '#251B37',
      border: '#443C68',
      textPrimary: '#F7EFE5',
      textMuted: '#E5B8F4',
      accentFocus: '#FF6E91',
      codeBg: '#110D20',
    },
  },
};

export function applyTheme(themeId: ThemeId) {
  if (typeof document === 'undefined') return;

  const html = document.documentElement;
  html.setAttribute('data-theme', themeId);
  try {
    localStorage.setItem('docwyrm_theme', themeId);
  } catch (e) {
    console.error(e);
  }

  if (themeId === 'default') {
    html.style.removeProperty('--canvas');
    html.style.removeProperty('--subtle');
    html.style.removeProperty('--border');
    html.style.removeProperty('--text-primary');
    html.style.removeProperty('--text-muted');
    html.style.removeProperty('--accent-focus');
    html.style.removeProperty('--code-bg');
    document.body.style.fontFamily = '';
  } else {
    html.classList.add('dark');
    const cfg = THEMES[themeId];
    if (cfg) {
      html.style.setProperty('--canvas', cfg.colors.canvas);
      html.style.setProperty('--subtle', cfg.colors.subtle);
      html.style.setProperty('--border', cfg.colors.border);
      html.style.setProperty('--text-primary', cfg.colors.textPrimary);
      html.style.setProperty('--text-muted', cfg.colors.textMuted);
      html.style.setProperty('--accent-focus', cfg.colors.accentFocus);
      html.style.setProperty('--code-bg', cfg.colors.codeBg);
      if (cfg.fontFamily) {
        document.body.style.fontFamily = cfg.fontFamily;
      } else {
        document.body.style.fontFamily = '';
      }
    }
  }

  // Dispatch custom event so all open tabs/components update immediately without reload
  window.dispatchEvent(new CustomEvent('docwyrm_theme_changed', { detail: themeId }));
}

export function getActiveTheme(): ThemeId {
  if (typeof localStorage === 'undefined') return 'default';
  try {
    return (localStorage.getItem('docwyrm_theme') as ThemeId) || 'default';
  } catch {
    return 'default';
  }
}

export function initTheme() {
  if (typeof window === 'undefined') return;
  const active = getActiveTheme();
  applyTheme(active);
}
