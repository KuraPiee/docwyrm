'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Store,
  Palette,
  Cpu,
  Sparkles,
  Search,
  Check,
  ArrowRight,
  ArrowLeft,
  Github,
  Download,
  Star,
  ExternalLink,
  Plus,
  X,
  Code2,
  Terminal,
  Layers,
  Moon,
  Sun,
  Play,
  Copy,
  ChevronDown,
  ChevronRight,
  FileCode2,
  GitBranch,
  Activity,
  Sliders,
} from 'lucide-react';

import { applyTheme, getActiveTheme, ThemeId, THEMES } from '@/lib/theme';
import { ThemeSelector } from '@/components/ThemeSelector';
import {
  createSpringEasing,
  spatialTreeTransition,
  glassDiffGlow,
  magneticPull,
} from '../../../../packages/spatial-motion/src/index';

interface MarketplaceItem {
  id: string;
  name: string;
  category: 'themes' | 'plugins' | 'animations';
  author: string;
  authorUrl: string;
  description: string;
  version: string;
  license: string;
  previewColors?: string[];
  animationType?: string;
  tags: string[];
  repoUrl: string;
  installed?: boolean;
}

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'themes' | 'plugins' | 'animations'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeThemeId, setActiveThemeId] = useState<ThemeId>('default');
  const [installedItems, setInstalledItems] = useState<Record<string, boolean>>({});
  const [starredItems, setStarredItems] = useState<Record<string, boolean>>({});
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  // --- Interactive Plugin States ---
  // RunMDX Playground
  const [codeRunnerInput, setCodeRunnerInput] = useState(`// Real-time in-browser code execution\nconst numbers = [12, 24, 36, 48];\nconst sum = numbers.reduce((a, b) => a + b, 0);\nconst avg = sum / numbers.length;\nconsole.log("Calculated Average:", avg);`);
  const [codeRunnerOutput, setCodeRunnerOutput] = useState<string | null>(null);

  // Mermaid Playground
  const [mermaidType, setMermaidType] = useState<'flowchart' | 'sequence' | 'git'>('flowchart');

  // KaTeX Playground
  const [activeFormula, setActiveFormula] = useState<'euler' | 'einstein' | 'schrodinger'>('euler');

  // OpenAPI Playground
  const [apiResponse, setApiResponse] = useState<any | null>(null);
  const [apiLoading, setApiLoading] = useState(false);

  // --- Interactive Animation States ---
  // Spatial Tree Demo
  const [treeExpanded, setTreeExpanded] = useState(true);
  const [springStiffness, setSpringStiffness] = useState(280);
  const [springDamping, setSpringDamping] = useState(22);
  const treeContainerRef = useRef<HTMLDivElement>(null);

  // Glass Diff Glow Demo
  const diffHunkRef = useRef<HTMLDivElement>(null);

  // Magnetic Pull Demo
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });
  const magneticButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Load active theme and installed extensions on mount
  useEffect(() => {
    try {
      const current = getActiveTheme();
      setActiveThemeId(current);

      const saved = localStorage.getItem('docwyrm_installed_extensions');
      if (saved) {
        setInstalledItems(JSON.parse(saved));
      }

      const savedStars = localStorage.getItem('docwyrm_starred_extensions');
      if (savedStars) {
        setStarredItems(JSON.parse(savedStars));
      }
    } catch (e) {
      console.error(e);
    }

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeId>;
      if (customEvent.detail) {
        setActiveThemeId(customEvent.detail);
      }
    };

    window.addEventListener('docwyrm_theme_changed', handleThemeChange);
    return () => window.removeEventListener('docwyrm_theme_changed', handleThemeChange);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleStar = (itemId: string, name: string) => {
    const next = !starredItems[itemId];
    const updated = { ...starredItems, [itemId]: next };
    setStarredItems(updated);
    try {
      localStorage.setItem('docwyrm_starred_extensions', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    showToast(next ? `⭐ Starred "${name}"!` : `Unstarred "${name}".`);
  };

  const handleApplyTheme = (themeKey: ThemeId, name: string) => {
    applyTheme(themeKey);
    setActiveThemeId(themeKey);
    setInstalledItems((prev) => ({ ...prev, [`theme-${themeKey}`]: true }));
    showToast(`🎨 "${name}" applied to Documentation Studio!`);
  };

  const handleInstallToggle = (item: MarketplaceItem) => {
    if (item.category === 'themes') {
      const themeKey = item.id.replace('theme-', '') as ThemeId;
      handleApplyTheme(themeKey, item.name);
      return;
    }

    const nextState = !installedItems[item.id];
    const updated = { ...installedItems, [item.id]: nextState };
    setInstalledItems(updated);
    try {
      localStorage.setItem('docwyrm_installed_extensions', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    if (nextState) {
      showToast(`🎉 "${item.name}" enabled across Docwyrm workspace!`);
    } else {
      showToast(`"${item.name}" disabled.`);
    }
  };

  // Run code safely in browser
  const executeSandboxCode = () => {
    const logs: string[] = [];
    const customConsole = {
      log: (...args: any[]) => logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
      warn: (...args: any[]) => logs.push(`[WARN] ${args.join(' ')}`),
      error: (...args: any[]) => logs.push(`[ERROR] ${args.join(' ')}`),
    };

    try {
      const runFn = new Function('console', codeRunnerInput);
      runFn(customConsole);
      setCodeRunnerOutput(logs.length > 0 ? logs.join('\n') : 'Code executed cleanly with no output.');
    } catch (err: any) {
      setCodeRunnerOutput(`Error: ${err.message}`);
    }
  };

  // Test live API call
  const executeApiCall = async () => {
    setApiLoading(true);
    const start = performance.now();
    try {
      const res = await fetch('http://localhost:4000/api/health');
      const data = await res.json();
      const elapsed = Math.round(performance.now() - start);
      setApiResponse({ status: res.status, ok: res.ok, elapsedMs: elapsed, data });
    } catch (e: any) {
      setApiResponse({ status: 500, ok: false, error: 'API connection failed. Make sure backend is running on port 4000.' });
    } finally {
      setApiLoading(false);
    }
  };

  // Trigger spatial tree animation
  const handleToggleTree = () => {
    const next = !treeExpanded;
    setTreeExpanded(next);
    if (treeContainerRef.current) {
      spatialTreeTransition(treeContainerRef.current, next, {
        stiffness: springStiffness,
        damping: springDamping,
        durationMs: 240,
      });
    }
  };

  // Trigger Diff Glow animation
  const handleTriggerDiffGlow = (type: 'added' | 'deleted') => {
    if (diffHunkRef.current) {
      glassDiffGlow(diffHunkRef.current, type, 800);
      showToast(`✨ Pulsed ${type === 'added' ? 'Emerald addition' : 'Crimson deletion'} glass diff glow!`);
    }
  };

  // Magnetic Pull Mouse Event
  const handleMagneticMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!magneticButtonRef.current) return;
    const rect = magneticButtonRef.current.getBoundingClientRect();
    const offset = magneticPull(rect, e.clientX, e.clientY, { strength: 0.4, maxDistance: 14 });
    setMagneticOffset(offset);
  };

  const handleMagneticMouseLeave = () => {
    setMagneticOffset({ x: 0, y: 0 });
  };

  const items: MarketplaceItem[] = [
    // --- THEMES ---
    {
      id: 'theme-tokyo-night',
      name: 'Tokyo Midnight',
      category: 'themes',
      author: 'Docwyrm Team (@KuraPiee)',
      authorUrl: 'https://github.com/KuraPiee',
      description:
        'A sleek, cyberpunk-inspired dark documentation theme featuring electric cyan, neon violet, and calm deep navy hues.',
      version: 'v1.0.0',
      license: 'MIT',
      previewColors: ['#1a1b26', '#7aa2f7', '#bb9af7', '#7dcfff'],
      tags: ['Cyberpunk', 'High Contrast', 'Code Optimized'],
      repoUrl: 'https://github.com/KuraPiee',
    },
    {
      id: 'theme-nordic-frost',
      name: 'Nordic Frost',
      category: 'themes',
      author: 'Docwyrm Team',
      authorUrl: 'https://github.com/KuraPiee',
      description:
        'An arctic palette inspired by Scandinavian cold tones with icy cyan highlights, soft grays, and soothing syntax highlighting.',
      version: 'v1.0.0',
      license: 'MIT',
      previewColors: ['#2e3440', '#3b4252', '#88c0d0', '#eceff4'],
      tags: ['Arctic', 'Calm Contrast', 'Nord'],
      repoUrl: 'https://github.com/KuraPiee',
    },
    {
      id: 'theme-emerald-obsidian',
      name: 'Emerald Obsidian',
      category: 'themes',
      author: 'Docwyrm Team',
      authorUrl: 'https://github.com/KuraPiee',
      description:
        'Deep slate dark canvas combined with lush emerald and mint green accents. Engineered for long documentation reading sessions.',
      version: 'v1.0.0',
      license: 'MIT',
      previewColors: ['#09130e', '#0f291e', '#10b981', '#6ee7b7'],
      tags: ['Emerald', 'Nature', 'Easy on Eyes'],
      repoUrl: 'https://github.com/KuraPiee',
    },
    {
      id: 'theme-retro-crt',
      name: 'Retro Terminal (Amber CRT)',
      category: 'themes',
      author: 'Docwyrm Team',
      authorUrl: 'https://github.com/KuraPiee',
      description:
        'Vintage 1980s mainframe aesthetics with warm amber phosphor glow, scanline textures, and authentic monospace terminal typography.',
      version: 'v1.0.0',
      license: 'MIT',
      previewColors: ['#0c0a09', '#1c1917', '#f59e0b', '#fbbf24'],
      tags: ['Retro', 'Amber', 'Hacker Terminal'],
      repoUrl: 'https://github.com/KuraPiee',
    },
    {
      id: 'theme-geist-minimal',
      name: 'Geist Minimalist',
      category: 'themes',
      author: 'Docwyrm Team',
      authorUrl: 'https://github.com/KuraPiee',
      description:
        'Pure monochromatic engineering aesthetic with Geist typography, hairline borders, and calm distraction-free reading contrast.',
      version: 'v1.0.0',
      license: 'MIT',
      previewColors: ['#000000', '#111111', '#888888', '#ffffff'],
      tags: ['Minimalist', 'Monochrome', 'Geist Font'],
      repoUrl: 'https://github.com/KuraPiee',
    },
    {
      id: 'theme-cyber-sunset',
      name: 'Sunset Vaporwave',
      category: 'themes',
      author: 'Docwyrm Team',
      authorUrl: 'https://github.com/KuraPiee',
      description:
        'Twilight dusk canvas infused with neon coral accents, soft violet borders, and luminous syntax highlighting.',
      version: 'v1.0.0',
      license: 'MIT',
      previewColors: ['#18122B', '#251B37', '#FF6E91', '#E5B8F4'],
      tags: ['Vaporwave', 'Neon', 'Vibrant'],
      repoUrl: 'https://github.com/KuraPiee',
    },

    // --- PLUGINS ---
    {
      id: 'plugin-runmdx',
      name: 'Interactive RunMDX Code Runner',
      category: 'plugins',
      author: 'Docwyrm Team',
      authorUrl: 'https://github.com/KuraPiee',
      description:
        'Turn static JavaScript and TypeScript code blocks into executable in-browser sandboxes with live console outputs and hot execution.',
      version: 'v0.9.4',
      license: 'Apache-2.0',
      tags: ['Playground', 'Live Execution', 'Interactive'],
      repoUrl: 'https://github.com/KuraPiee',
    },
    {
      id: 'plugin-mermaid',
      name: 'Mermaid Diagram Studio',
      category: 'plugins',
      author: 'Docwyrm Team',
      authorUrl: 'https://github.com/KuraPiee',
      description:
        'Native rendering for Mermaid code blocks (flowcharts, sequence diagrams, state machines, and git graphs) directly in MDX.',
      version: 'v1.1.2',
      license: 'MIT',
      tags: ['Architecture', 'Diagrams', 'Flowcharts'],
      repoUrl: 'https://github.com/KuraPiee',
    },
    {
      id: 'plugin-katex',
      name: 'KaTeX Mathematical Typesetting',
      category: 'plugins',
      author: 'Docwyrm Team',
      authorUrl: 'https://github.com/KuraPiee',
      description:
        'Blazing-fast LaTeX math rendering for complex formulas, algorithmic proofs, and scientific research publications.',
      version: 'v0.16.8',
      license: 'MIT',
      tags: ['LaTeX', 'Math', 'Algorithms'],
      repoUrl: 'https://github.com/KuraPiee',
    },
    {
      id: 'plugin-openapi-tester',
      name: 'OpenAPI / Swagger Client',
      category: 'plugins',
      author: 'Docwyrm Team',
      authorUrl: 'https://github.com/KuraPiee',
      description:
        'Embed interactive API endpoint inspectors right inside docs with headers, parameters, response codes, and curl generation.',
      version: 'v1.0.0',
      license: 'MIT',
      tags: ['REST API', 'OpenAPI', 'Swagger'],
      repoUrl: 'https://github.com/KuraPiee',
    },

    // --- ANIMATIONS ---
    {
      id: 'anim-spatial-tree',
      name: 'Spatial Tree Physics Transition',
      category: 'animations',
      author: 'Docwyrm Team',
      authorUrl: 'https://github.com/KuraPiee',
      description:
        'Physics-based spring easing curve for tree node collapsing, document re-ordering, and smooth accordion morphing without layout jitter.',
      version: 'v0.1.0',
      license: 'MIT',
      animationType: 'Spring Physics',
      tags: ['Physics Motion', 'Zero Jitter', 'Reduced-Motion Safe'],
      repoUrl: 'https://github.com/KuraPiee',
    },
    {
      id: 'anim-glass-diff',
      name: 'Glassmorphism Diff Inspector',
      category: 'animations',
      author: 'Docwyrm Team',
      authorUrl: 'https://github.com/KuraPiee',
      description:
        'Subtle frosted-glass illumination effects on added and deleted Git hunks with smooth hover depth scaling.',
      version: 'v0.1.0',
      license: 'MIT',
      animationType: 'Frosted Glass Depth',
      tags: ['Visual Diff', 'Glow', 'Modern'],
      repoUrl: 'https://github.com/KuraPiee',
    },
    {
      id: 'anim-magnetic-pull',
      name: 'Magnetic Cursor Spring Physics',
      category: 'animations',
      author: 'Docwyrm Team (@KuraPiee)',
      authorUrl: 'https://github.com/KuraPiee',
      description:
        'Subtle magnetic pull micro-interactions for interactive buttons, avatar pills, and breadcrumbs with physics return bounce.',
      version: 'v0.1.0',
      license: 'MIT',
      animationType: 'Magnetic WAAPI',
      tags: ['Micro-interaction', 'Fluid', 'Magnetic'],
      repoUrl: 'https://github.com/KuraPiee',
    },
  ];

  const filteredItems = items.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="min-h-screen flex flex-col bg-canvas-light dark:bg-canvas-dark text-textPrimary-light dark:text-textPrimary-dark">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-border-light dark:border-border-dark bg-canvas-light/90 dark:bg-canvas-dark/90 backdrop-blur-md px-4 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-textMuted-light dark:text-textMuted-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>
          <div className="h-4 w-px bg-border-light dark:border-border-dark" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <Store className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight">Docwyrm Marketplace</span>
            <span className="text-[10px] bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-mono px-2 py-0.5 rounded-full">
              Community Hub
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Theme Switcher */}
          <ThemeSelector />

          {/* Direct GitHub Profile */}
          <a
            href="https://github.com/KuraPiee"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark text-textPrimary-light dark:text-textPrimary-dark text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-xs"
            title="Docwyrm Team GitHub Profile (@KuraPiee)"
          >
            <Github className="w-3.5 h-3.5 text-orange-500" />
            <span>GitHub (@KuraPiee)</span>
          </a>

          {/* Standalone Repo Open Modal */}
          <button
            onClick={() => setIsRepoModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-semibold hover:bg-orange-500/20 transition-all shadow-xs"
          >
            <Github className="w-3.5 h-3.5" />
            <span>Open-Source Motion Repo</span>
          </button>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publish Extension</span>
          </button>
        </div>
      </header>

      {/* Hero Header */}
      <section className="relative px-4 sm:px-8 py-12 border-b border-border-light dark:border-border-dark bg-subtle-light/40 dark:bg-subtle-dark/40 overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark text-xs font-medium text-textMuted-light dark:text-textMuted-dark shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>100% Open Ecosystem &bull; Real-Time Themes &bull; Interactive Sandbox</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textPrimary-light dark:text-textPrimary-dark">
            Extend Docwyrm with Custom Themes & Plugins
          </h1>

          <p className="max-w-2xl mx-auto text-sm text-textMuted-light dark:text-textMuted-dark leading-relaxed">
            Customize every pixel of your documentation workspace. Click <strong>Apply Theme</strong> to transform the entire application in real-time, or test live executable sandboxes and physics animations below.
          </p>

          {/* Search bar */}
          <div className="pt-2 max-w-xl mx-auto">
            <div className="relative">
              <Search className="w-4 h-4 text-textMuted-light dark:text-textMuted-dark absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search themes, interactive plugins, or animation packages..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark text-textPrimary-light dark:text-textPrimary-dark placeholder:text-textMuted-light dark:placeholder:text-textMuted-dark text-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500 transition-all shadow-xs"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 flex-1 w-full space-y-8">
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-light dark:border-border-dark pb-4">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-subtle-light dark:bg-subtle-dark border border-border-light dark:border-border-dark">
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeCategory === 'all'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                  : 'text-textMuted-light dark:text-textMuted-dark hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>All Extensions</span>
            </button>
            <button
              onClick={() => setActiveCategory('themes')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeCategory === 'themes'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                  : 'text-textMuted-light dark:text-textMuted-dark hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Themes ({items.filter((i) => i.category === 'themes').length})</span>
            </button>
            <button
              onClick={() => setActiveCategory('plugins')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeCategory === 'plugins'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                  : 'text-textMuted-light dark:text-textMuted-dark hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Plugins ({items.filter((i) => i.category === 'plugins').length})</span>
            </button>
            <button
              onClick={() => setActiveCategory('animations')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeCategory === 'animations'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                  : 'text-textMuted-light dark:text-textMuted-dark hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Animations ({items.filter((i) => i.category === 'animations').length})</span>
            </button>
          </div>

          <span className="text-xs text-textMuted-light dark:text-textMuted-dark">
            Showing <strong className="text-textPrimary-light dark:text-textPrimary-dark">{filteredItems.length}</strong> extensions
          </span>
        </div>

        {/* Extensions Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isInstalled = !!installedItems[item.id];
            const isTheme = item.category === 'themes';
            const themeKey = item.id.replace('theme-', '') as ThemeId;
            const isCurrentTheme = isTheme && activeThemeId === themeKey;

            return (
              <div
                key={item.id}
                className={`flex flex-col justify-between rounded-2xl border transition-all shadow-xs hover:shadow-md ${
                  isCurrentTheme
                    ? 'border-orange-500 bg-canvas-light dark:bg-canvas-dark ring-2 ring-orange-500/20'
                    : 'border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark hover:border-neutral-400 dark:hover:border-neutral-600'
                } p-6`}
              >
                <div>
                  {/* Card Header: Category badge & stats */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        item.category === 'themes'
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                          : item.category === 'plugins'
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {item.category}
                    </span>

                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-textMuted-light dark:text-textMuted-dark text-[10px]">
                        {item.version}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-textMuted-light dark:text-textMuted-dark text-[10px]">
                        {item.license}
                      </span>
                      <button
                        onClick={() => handleToggleStar(item.id, item.name)}
                        className={`p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                          starredItems[item.id] ? 'text-amber-500' : 'text-neutral-400 hover:text-amber-500'
                        }`}
                        title={starredItems[item.id] ? 'Starred by you' : 'Star this extension'}
                      >
                        <Star className={`w-3.5 h-3.5 ${starredItems[item.id] ? 'fill-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Author */}
                  <h3 className="text-base font-bold text-textPrimary-light dark:text-textPrimary-dark mb-1">
                    {item.name}
                  </h3>

                  <div className="text-[11px] text-textMuted-light dark:text-textMuted-dark mb-3 flex items-center gap-1">
                    <span>by</span>
                    <a
                      href={item.authorUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-textPrimary-light dark:text-textPrimary-dark hover:underline flex items-center gap-0.5"
                    >
                      <span>{item.author}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-textMuted-light dark:text-textMuted-dark leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* --- THEME LIVE PREVIEW MINIATURE --- */}
                  {isTheme && item.previewColors && (
                    <div className="p-3 rounded-xl border border-border-light dark:border-border-dark bg-subtle-light dark:bg-subtle-dark mb-4 space-y-2">
                      <div className="text-[10px] font-semibold text-textMuted-light dark:text-textMuted-dark uppercase tracking-wider">
                        Color Palette Swatch
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.previewColors.map((c, idx) => (
                          <div
                            key={idx}
                            className="flex-1 h-5 rounded-md border border-black/10 shadow-xs"
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* --- RUNMDX LIVE MINI-PLAYGROUND --- */}
                  {item.id === 'plugin-runmdx' && (
                    <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 mb-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <Terminal className="w-3.5 h-3.5" />
                          <span>Live In-Browser Runner</span>
                        </span>
                        <button
                          onClick={executeSandboxCode}
                          className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] flex items-center gap-1 transition-colors"
                        >
                          <Play className="w-2.5 h-2.5 fill-white" />
                          <span>Run</span>
                        </button>
                      </div>
                      <textarea
                        value={codeRunnerInput}
                        onChange={(e) => setCodeRunnerInput(e.target.value)}
                        rows={3}
                        className="w-full text-[11px] font-mono p-2 rounded bg-neutral-900 text-neutral-100 border border-neutral-800 focus:outline-hidden"
                      />
                      {codeRunnerOutput && (
                        <div className="text-[10px] font-mono p-1.5 rounded bg-black/80 text-emerald-400 border border-emerald-500/30">
                          {codeRunnerOutput}
                        </div>
                      )}
                    </div>
                  )}

                  {/* --- MERMAID LIVE MINI-PLAYGROUND --- */}
                  {item.id === 'plugin-mermaid' && (
                    <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 mb-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <GitBranch className="w-3.5 h-3.5" />
                          <span>Architecture Diagram</span>
                        </span>
                        <div className="flex gap-1">
                          {(['flowchart', 'sequence', 'git'] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setMermaidType(t)}
                              className={`px-1.5 py-0.5 rounded text-[10px] capitalize ${
                                mermaidType === t
                                  ? 'bg-blue-600 text-white font-semibold'
                                  : 'bg-neutral-200 dark:bg-neutral-800 text-textMuted-light dark:text-textMuted-dark'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center min-h-[90px]">
                        {mermaidType === 'flowchart' && (
                          <svg className="w-full h-16" viewBox="0 0 300 60">
                            <rect x="10" y="15" width="70" height="30" rx="6" fill="#1e293b" stroke="#3b82f6" />
                            <text x="45" y="34" fill="#93c5fd" fontSize="9" textAnchor="middle" fontFamily="monospace">Client</text>
                            <line x1="80" y1="30" x2="130" y2="30" stroke="#60a5fa" strokeWidth="2" strokeDasharray="3,3" />
                            <rect x="130" y="15" width="80" height="30" rx="6" fill="#0f172a" stroke="#10b981" />
                            <text x="170" y="34" fill="#6ee7b7" fontSize="9" textAnchor="middle" fontFamily="monospace">Fastify API</text>
                            <line x1="210" y1="30" x2="250" y2="30" stroke="#34d399" strokeWidth="2" />
                            <rect x="250" y="15" width="40" height="30" rx="6" fill="#1e1b4b" stroke="#a855f7" />
                            <text x="270" y="34" fill="#d8b4fe" fontSize="9" textAnchor="middle" fontFamily="monospace">Git</text>
                          </svg>
                        )}
                        {mermaidType === 'sequence' && (
                          <div className="text-[10px] font-mono text-neutral-300 space-y-1 w-full text-center">
                            <div>Client -&gt;&gt; Docwyrm: POST /commit</div>
                            <div className="text-emerald-400">Docwyrm --&gt;&gt; Git: Isomorphic Push (OK)</div>
                          </div>
                        )}
                        {mermaidType === 'git' && (
                          <div className="text-[10px] font-mono text-neutral-300 flex items-center justify-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">main ●</span>
                            <span>➔</span>
                            <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">feature-theme ●</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* --- KATEX LIVE MINI-PLAYGROUND --- */}
                  {item.id === 'plugin-katex' && (
                    <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 mb-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <Code2 className="w-3.5 h-3.5" />
                          <span>LaTeX Equations</span>
                        </span>
                        <div className="flex gap-1">
                          {(['euler', 'einstein', 'schrodinger'] as const).map((f) => (
                            <button
                              key={f}
                              onClick={() => setActiveFormula(f)}
                              className={`px-1.5 py-0.5 rounded text-[10px] capitalize ${
                                activeFormula === f
                                  ? 'bg-blue-600 text-white font-semibold'
                                  : 'bg-neutral-200 dark:bg-neutral-800 text-textMuted-light dark:text-textMuted-dark'
                              }`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-center font-serif text-sm text-neutral-100 min-h-[50px] flex items-center justify-center">
                        {activeFormula === 'euler' && <span>e^{'{i\\pi}'} + 1 = 0</span>}
                        {activeFormula === 'einstein' && <span>E^2 = (pc)^2 + (m_0 c^2)^2</span>}
                        {activeFormula === 'schrodinger' && <span>i\hbar \frac{'{'}\partial{'}'}{'{'}\partial t{'}'} \Psi = \hat{'{'}H{'}'} \Psi</span>}
                      </div>
                    </div>
                  )}

                  {/* --- OPENAPI LIVE MINI-PLAYGROUND --- */}
                  {item.id === 'plugin-openapi-tester' && (
                    <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 mb-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5" />
                          <span>Test GET /api/health</span>
                        </span>
                        <button
                          onClick={executeApiCall}
                          disabled={apiLoading}
                          className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-[10px] flex items-center gap-1 transition-colors"
                        >
                          {apiLoading ? 'Testing...' : 'Send Request'}
                        </button>
                      </div>
                      {apiResponse ? (
                        <div className="text-[10px] font-mono p-1.5 rounded bg-neutral-900 text-emerald-400 border border-neutral-800">
                          <div>Status: {apiResponse.status} ({apiResponse.elapsedMs}ms)</div>
                          <div className="truncate text-neutral-300">{JSON.stringify(apiResponse.data || apiResponse.error)}</div>
                        </div>
                      ) : (
                        <div className="text-[10px] text-textMuted-light dark:text-textMuted-dark italic">
                          Click "Send Request" to ping the live Fastify backend on port 4000.
                        </div>
                      )}
                    </div>
                  )}

                  {/* --- SPATIAL TREE LIVE PHYSICS PLAYGROUND --- */}
                  {item.id === 'anim-spatial-tree' && (
                    <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 mb-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Interactive Physics Tree</span>
                        </span>
                        <button
                          onClick={handleToggleTree}
                          className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] flex items-center gap-1 transition-colors shadow-xs"
                        >
                          {treeExpanded ? 'Spring Collapse' : 'Spring Expand'}
                        </button>
                      </div>

                      {/* Interactive Tree Box */}
                      <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-200">
                        <div
                          onClick={handleToggleTree}
                          className="flex items-center gap-1 cursor-pointer font-semibold text-emerald-400 hover:text-emerald-300"
                        >
                          {treeExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          <span>📁 src/components</span>
                        </div>
                        <div ref={treeContainerRef} className="pl-4 space-y-1 pt-1 overflow-hidden">
                          <div className="text-neutral-400 flex items-center gap-1">
                            <FileCode2 className="w-3 h-3 text-blue-400" />
                            <span>DocReader.tsx</span>
                          </div>
                          <div className="text-neutral-400 flex items-center gap-1">
                            <FileCode2 className="w-3 h-3 text-orange-400" />
                            <span>ThemeSelector.tsx</span>
                          </div>
                        </div>
                      </div>

                      {/* Physics parameter sliders */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                        <div>
                          <div className="flex justify-between text-neutral-400">
                            <span>Stiffness:</span>
                            <span className="font-mono text-emerald-400">{springStiffness}</span>
                          </div>
                          <input
                            type="range"
                            min="150"
                            max="450"
                            value={springStiffness}
                            onChange={(e) => setSpringStiffness(Number(e.target.value))}
                            className="w-full accent-emerald-500"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-neutral-400">
                            <span>Damping:</span>
                            <span className="font-mono text-emerald-400">{springDamping}</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="40"
                            value={springDamping}
                            onChange={(e) => setSpringDamping(Number(e.target.value))}
                            className="w-full accent-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- GLASS DIFF GLOW PLAYGROUND --- */}
                  {item.id === 'anim-glass-diff' && (
                    <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 mb-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5" />
                          <span>Frosted Glass Diff</span>
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleTriggerDiffGlow('added')}
                            className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-semibold"
                          >
                            + Add Glow
                          </button>
                          <button
                            onClick={() => handleTriggerDiffGlow('deleted')}
                            className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-semibold"
                          >
                            - Delete Glow
                          </button>
                        </div>
                      </div>

                      <div
                        ref={diffHunkRef}
                        className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-[10px] font-mono space-y-0.5 transition-all"
                      >
                        <div className="text-emerald-400 bg-emerald-950/40 px-1 py-0.5 rounded">
                          + export function applyTheme(id: ThemeId)
                        </div>
                        <div className="text-rose-400 bg-rose-950/40 px-1 py-0.5 rounded">
                          - function setStaticTheme()
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- MAGNETIC CURSOR PLAYGROUND --- */}
                  {item.id === 'anim-magnetic-pull' && (
                    <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 mb-4 space-y-2">
                      <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Hover over the button to test magnetic pull:</span>
                      </div>
                      <div className="py-2 flex justify-center items-center">
                        <button
                          ref={magneticButtonRef}
                          onMouseMove={handleMagneticMouseMove}
                          onMouseLeave={handleMagneticMouseLeave}
                          style={{
                            transform: `translate(${magneticOffset.x}px, ${magneticOffset.y}px)`,
                            transition: magneticOffset.x === 0 ? 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
                          }}
                          className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-600/30 flex items-center gap-2 cursor-pointer select-none"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Magnetic Target</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {item.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-textMuted-light dark:text-textMuted-dark px-2 py-0.5 rounded"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="pt-4 border-t border-border-light dark:border-border-dark flex items-center gap-2">
                  <button
                    onClick={() => handleInstallToggle(item)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs ${
                      isTheme
                        ? isCurrentTheme
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100'
                        : isInstalled
                        ? 'bg-emerald-600 text-white'
                        : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100'
                    }`}
                  >
                    {isTheme ? (
                      isCurrentTheme ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Applied to Studio</span>
                        </>
                      ) : (
                        <>
                          <Palette className="w-3.5 h-3.5" />
                          <span>Apply to Studio</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )
                    ) : isInstalled ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Enabled in Studio</span>
                      </>
                    ) : (
                      <>
                        <Cpu className="w-3.5 h-3.5" />
                        <span>Install Extension</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  {isTheme && isCurrentTheme && (
                    <Link
                      href="/docs"
                      className="py-2 px-3 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 flex items-center gap-1 transition-colors shadow-xs"
                      title="Open Documentation Studio"
                    >
                      <span>Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  <a
                    href={item.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg border border-border-light dark:border-border-dark hover:bg-neutral-100 dark:hover:bg-neutral-800 text-textMuted-light dark:text-textMuted-dark transition-colors"
                    title="View Source on GitHub"
                  >
                    <Github className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Standalone Open-Source Motion Repo Modal */}
      {isRepoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl rounded-2xl border border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark p-6 sm:p-8 shadow-2xl space-y-6 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-textPrimary-light dark:text-textPrimary-dark">
                    @docwyrm/spatial-motion
                  </h3>
                  <p className="text-xs text-textMuted-light dark:text-textMuted-dark">
                    Standalone open-source physics animation library for external developers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRepoModalOpen(false)}
                className="p-1 rounded-lg text-textMuted-light dark:text-textMuted-dark hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-textPrimary-light dark:text-textPrimary-dark">
              <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-border-light dark:border-border-dark font-mono space-y-2">
                <div className="text-[10px] text-textMuted-light dark:text-textMuted-dark uppercase tracking-wider">
                  Install via npm or pnpm
                </div>
                <div className="text-orange-600 dark:text-orange-400 font-bold">
                  pnpm add @docwyrm/spatial-motion
                </div>
                <div className="text-textMuted-light dark:text-textMuted-dark text-[11px]">
                  git clone https://github.com/KuraPiee/spatial-motion.git
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm mb-1">Architectural Highlights</h4>
                <ul className="list-disc list-inside space-y-1 text-textMuted-light dark:text-textMuted-dark">
                  <li><strong>Hardware Accelerated</strong>: Uses Web Animations API (WAAPI) running on compositor thread.</li>
                  <li><strong>Damped Harmonic Physics</strong>: Natural spring easing calculation from mass, stiffness, and damping.</li>
                  <li><strong>Zero Layout Shift</strong>: Spring accordion morphing calculated with scrollHeight bounds.</li>
                  <li><strong>Reduced-Motion Native</strong>: Automatically detects user accessibility preferences.</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                ⭐ Ready to be published to npm & GitHub as an independent community open-source package under MIT License by Docwyrm Team (@KuraPiee).
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setIsRepoModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Close
              </button>
              <a
                href="https://github.com/KuraPiee"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 flex items-center gap-1.5"
              >
                <span>View Author Profile</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Submit Extension Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl border border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark p-6 sm:p-8 shadow-2xl space-y-6 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-4">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-bold text-textPrimary-light dark:text-textPrimary-dark">
                  Submit Community Extension
                </h3>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 rounded-lg text-textMuted-light dark:text-textMuted-dark hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-textMuted-light dark:text-textMuted-dark">
                Docwyrm extensions and themes are fully open-source. Submit your theme or plugin repository to have it indexed on the Marketplace:
              </p>

              <div>
                <label className="block font-semibold mb-1">GitHub Repository URL</label>
                <input
                  type="text"
                  placeholder="https://github.com/your-name/docwyrm-theme"
                  className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Extension Category</label>
                <select className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark text-xs">
                  <option value="theme">Color Theme</option>
                  <option value="plugin">MDX Block Plugin</option>
                  <option value="animation">Motion Primitive</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-300 text-[11px]">
                💡 You can also submit extensions directly via Git Pull Request to <code>packages/marketplace/registry.json</code> in the Docwyrm repository.
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-border-light dark:border-border-dark text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsSubmitModalOpen(false);
                  showToast('🎉 Submission received! Our review pipeline will verify the manifest.');
                }}
                className="px-4 py-2 rounded-lg bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700"
              >
                Submit for Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium shadow-2xl flex items-center gap-2 animate-slideUp">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
