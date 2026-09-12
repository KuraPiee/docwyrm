'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import {
  SUPPORTED_LOCALES,
  SupportedLocale,
  getActiveLocale,
  setLocale,
} from '@/lib/i18n';

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeLang, setActiveLang] = useState<SupportedLocale>('en');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveLang(getActiveLocale());

    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<SupportedLocale>;
      if (customEvent.detail) {
        setActiveLang(customEvent.detail);
      }
    };

    window.addEventListener('docwyrm_lang_changed', handleLangChange);
    return () => window.removeEventListener('docwyrm_lang_changed', handleLangChange);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLocale = SUPPORTED_LOCALES.find((l) => l.code === activeLang) || SUPPORTED_LOCALES[0];

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-border-light dark:border-border-dark bg-subtle-light dark:bg-subtle-dark hover:border-neutral-400 dark:hover:border-neutral-600 text-textPrimary-light dark:text-textPrimary-dark text-xs font-medium transition-all shadow-xs"
        title="Change Language"
      >
        <span className="text-sm">{currentLocale.flag}</span>
        <span className="hidden sm:inline font-mono text-[11px] uppercase">{currentLocale.code}</span>
        <ChevronDown className="w-3 h-3 text-textMuted-light dark:text-textMuted-dark" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-xl border border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark shadow-2xl py-1 z-50 animate-scaleIn text-xs">
          <div className="px-3 py-1 text-[10px] font-semibold text-textMuted-light dark:text-textMuted-dark uppercase tracking-wider border-b border-border-light dark:border-border-dark mb-1">
            Language / Dil
          </div>
          {SUPPORTED_LOCALES.map((loc) => {
            const isSelected = activeLang === loc.code;
            return (
              <button
                key={loc.code}
                onClick={() => {
                  setLocale(loc.code);
                  setActiveLang(loc.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 transition-colors ${
                  isSelected
                    ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold'
                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-textPrimary-light dark:text-textPrimary-dark'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{loc.flag}</span>
                  <span>{loc.name}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-orange-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
