'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, ChevronDown } from 'lucide-react';
import { THEMES, ThemeId, applyTheme, getActiveTheme } from '@/lib/theme';

export function ThemeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState<ThemeId>('default');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveTheme(getActiveTheme());

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeId>;
      if (customEvent.detail) {
        setActiveTheme(customEvent.detail);
      }
    };

    window.addEventListener('docwyrm_theme_changed', handleThemeChange);
    return () => window.removeEventListener('docwyrm_theme_changed', handleThemeChange);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: ThemeId) => {
    applyTheme(id);
    setActiveTheme(id);
    setIsOpen(false);
  };

  const currentConfig = THEMES[activeTheme] || THEMES.default;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-border-light dark:border-border-dark bg-subtle-light dark:bg-subtle-dark hover:border-neutral-400 dark:hover:border-neutral-600 text-textPrimary-light dark:text-textPrimary-dark text-xs font-medium transition-all shadow-sm"
        title="Change Documentation Theme"
      >
        <Palette className="w-3.5 h-3.5 text-orange-500" />
        <span className="hidden sm:inline font-medium">{currentConfig.name}</span>
        <ChevronDown className="w-3 h-3 text-textMuted-light dark:text-textMuted-dark" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark shadow-2xl py-2 z-50 animate-scaleIn text-xs">
          <div className="px-3 py-1.5 border-b border-border-light dark:border-border-dark mb-1">
            <div className="font-semibold text-textPrimary-light dark:text-textPrimary-dark">
              Active Community Themes
            </div>
            <div className="text-[10px] text-textMuted-light dark:text-textMuted-dark">
              Transforms canvas, borders, code, and accents
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-0.5 px-1.5">
            {(Object.keys(THEMES) as ThemeId[]).map((themeId) => {
              const theme = THEMES[themeId];
              const isSelected = activeTheme === themeId;

              return (
                <button
                  key={themeId}
                  onClick={() => handleSelect(themeId)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold text-textPrimary-light dark:text-textPrimary-dark'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-textMuted-light dark:text-textMuted-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Swatch dots */}
                    <div className="flex -space-x-1">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs"
                        style={{ backgroundColor: theme.colors.canvas }}
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs"
                        style={{ backgroundColor: theme.colors.accentFocus }}
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs"
                        style={{ backgroundColor: theme.colors.textPrimary }}
                      />
                    </div>
                    <div>
                      <div className="text-xs">{theme.name}</div>
                      <a
                        href={theme.authorUrl || 'https://github.com/KuraPiee'}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] opacity-60 hover:opacity-100 hover:underline truncate max-w-[120px] block text-textMuted-light dark:text-textMuted-dark hover:text-orange-600 dark:hover:text-orange-400"
                      >
                        {theme.author}
                      </a>
                    </div>
                  </div>

                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
