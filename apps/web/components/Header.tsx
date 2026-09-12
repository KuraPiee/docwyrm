'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  GitBranch,
  Moon,
  Sun,
  BookOpen,
  Edit3,
  History,
  Check,
  Download,
  ChevronDown,
  Plus,
  Book,
  Trash2,
  Lock,
  ExternalLink,
  Activity,
  FileDown,
  Printer,
  Archive,
  Users,
} from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { getActiveLocale, TRANSLATIONS } from '@/lib/i18n';

interface DocBookItem {
  id: string;
  title: string;
  slug: string;
}

interface HeaderProps {
  spaceTitle: string;
  spaces?: DocBookItem[];
  activeSpaceId?: string;
  onSelectSpace?: (spaceId: string) => void;
  onCreateSpace?: () => void;
  branch: string;
  synced: boolean;
  viewMode: 'read' | 'edit' | 'diff';
  onViewModeChange: (mode: 'read' | 'edit' | 'diff') => void;
  onOpenSearch: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  branches?: string[];
  onSelectBranch?: (branch: string) => void;
  onCreateBranch?: (branch: string) => void;
  onExportDoc?: () => void;
  onExportPdf?: () => void;
  onExportBook?: () => void;
  onOpenAnalytics?: () => void;
}

export function Header({
  spaceTitle,
  spaces = [],
  activeSpaceId,
  onSelectSpace,
  onCreateSpace,
  branch,
  synced,
  viewMode,
  onViewModeChange,
  onOpenSearch,
  isDark,
  onToggleTheme,
  branches = ['main', 'drafts', 'v1-release'],
  onSelectBranch,
  onCreateBranch,
  onExportDoc,
  onExportPdf,
  onExportBook,
  onOpenAnalytics,
}: HeaderProps) {
  const [branchMenuOpen, setBranchMenuOpen] = useState(false);
  const [spaceMenuOpen, setSpaceMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const spaceMenuRef = useRef<HTMLDivElement>(null);
  const branchMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const loc = getActiveLocale();
  const t = (k: string) => TRANSLATIONS[loc]?.[k] || TRANSLATIONS.en[k] || k;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (spaceMenuRef.current && !spaceMenuRef.current.contains(event.target as Node)) {
        setSpaceMenuOpen(false);
      }
      if (branchMenuRef.current && !branchMenuRef.current.contains(event.target as Node)) {
        setBranchMenuOpen(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentBookIndex = spaces.findIndex((s) => s.id === activeSpaceId);
  const bookIndexDisplay = currentBookIndex >= 0 ? currentBookIndex + 1 : 1;

  return (
    <header className="h-13 border-b border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark px-4 flex items-center justify-between select-none sticky top-0 z-30 transition-colors">
      {/* Left: Brand, Book Selector & Author / Multiplayer Status */}
      <div className="flex items-center space-x-3">
        <Link
          href="/"
          className="flex items-center space-x-2 font-semibold text-sm tracking-tight text-textPrimary-light dark:text-textPrimary-dark hover:opacity-85 transition-opacity"
          title="Return to Home"
        >
          <div className="w-5 h-5 rounded bg-orange-600 flex items-center justify-center text-white text-xs font-mono font-bold shadow-xs">
            DW
          </div>
          <span className="font-bold">Docwyrm</span>
        </Link>

        <span className="text-textMuted-light dark:text-textMuted-dark font-normal">/</span>

        {/* Space / Book Switcher Dropdown */}
        <div className="relative" ref={spaceMenuRef}>
          <button
            onClick={() => setSpaceMenuOpen(!spaceMenuOpen)}
            className="flex items-center space-x-1.5 px-2 py-1 rounded-md text-xs font-semibold text-textPrimary-light dark:text-textPrimary-dark hover:bg-subtle-light dark:hover:bg-subtle-dark border border-transparent hover:border-border-light dark:hover:border-border-dark transition-colors"
          >
            <Book className="w-3.5 h-3.5 text-orange-500" />
            <span className="max-w-[160px] sm:max-w-[220px] truncate">{spaceTitle}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-semibold">
              Book {bookIndexDisplay}/3
            </span>
            <ChevronDown className="w-3 h-3 text-textMuted-light dark:text-textMuted-dark" />
          </button>

          {spaceMenuOpen && (
            <div className="absolute left-0 mt-1.5 w-72 rounded-xl border border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark shadow-2xl py-2 z-50 animate-scaleIn text-xs">
              <div className="px-3 py-1.5 border-b border-border-light dark:border-border-dark mb-1 flex items-center justify-between">
                <div>
                  <div className="font-bold text-textPrimary-light dark:text-textPrimary-dark">
                    {t('docBooks')}
                  </div>
                  <div className="text-[10px] text-textMuted-light dark:text-textMuted-dark">
                    {t('freeTierNotice')}
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-textPrimary-light dark:text-textPrimary-dark">
                  {spaces.length} / 3 {t('used')}
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-0.5 px-1.5">
                {spaces.map((s, idx) => {
                  const isCurrent = s.id === activeSpaceId;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSpaceMenuOpen(false);
                        if (onSelectSpace) onSelectSpace(s.id);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                        isCurrent
                          ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold border border-orange-500/20'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-textPrimary-light dark:text-textPrimary-dark'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <Book className={`w-3.5 h-3.5 flex-shrink-0 ${isCurrent ? 'text-orange-500' : 'text-neutral-400'}`} />
                        <div className="truncate">
                          <div className="truncate font-medium">{s.title}</div>
                          <div className="text-[10px] text-textMuted-light dark:text-textMuted-dark font-mono">
                            /{s.slug} &bull; Book #{idx + 1}
                          </div>
                        </div>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Bottom Book Actions */}
              <div className="pt-2 mt-1 border-t border-border-light dark:border-border-dark px-2">
                {spaces.length < 3 ? (
                  <button
                    onClick={() => {
                      setSpaceMenuOpen(false);
                      if (onCreateSpace) onCreateSpace();
                    }}
                    className="w-full flex items-center justify-center space-x-1.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('createBook')} ({spaces.length + 1} of 3)</span>
                  </button>
                ) : (
                  <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-border-light dark:border-border-dark text-[11px] text-textMuted-light dark:text-textMuted-dark flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span>{t('freeLimitReached')}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live Author / Collaborator Status */}
        <div className="hidden lg:flex items-center space-x-2 pl-3 border-l border-border-light dark:border-border-dark">
          <div className="flex items-center">
            <a
              href="https://github.com/KuraPiee"
              target="_blank"
              rel="noreferrer"
              title="Docwyrm Team (@KuraPiee) - Active Author"
              className="relative transition-transform hover:scale-110"
            >
              <img
                src="https://github.com/KuraPiee.png"
                alt="Docwyrm Team (@KuraPiee)"
                className="w-6 h-6 rounded-full border-2 border-orange-500 object-cover shadow-xs"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-black" />
            </a>
          </div>

          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-[10px] font-mono text-emerald-700 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t('gitSynced')}</span>
          </div>
        </div>
      </div>

      {/* Center: Search trigger */}
      <button
        onClick={onOpenSearch}
        className="flex items-center space-x-2 w-52 sm:w-64 px-3 py-1.5 rounded-lg text-xs bg-subtle-light dark:bg-subtle-dark text-textMuted-light dark:text-textMuted-dark border border-border-light dark:border-border-dark hover:border-orange-500 transition-colors"
      >
        <Search className="w-3.5 h-3.5 text-orange-500" />
        <span className="flex-1 text-left truncate">{t('searchPlaceholder')}</span>
        <kbd className="text-[10px] font-mono bg-canvas-light dark:bg-canvas-dark border border-border-light dark:border-border-dark px-1.5 py-0.5 rounded">
          Ctrl K
        </kbd>
      </button>

      {/* Right: View mode, Git branch, Stats, Export, Theme, Language, Dark/Light */}
      <div className="flex items-center space-x-2">
        {/* Mode Switcher */}
        <div className="flex items-center p-0.5 rounded-lg bg-subtle-light dark:bg-subtle-dark border border-border-light dark:border-border-dark text-xs">
          <button
            onClick={() => onViewModeChange('read')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-colors ${
              viewMode === 'read'
                ? 'bg-canvas-light dark:bg-canvas-dark font-medium text-textPrimary-light dark:text-textPrimary-dark shadow-xs'
                : 'text-textMuted-light dark:text-textMuted-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t('read')}</span>
          </button>
          <button
            onClick={() => onViewModeChange('edit')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-colors ${
              viewMode === 'edit'
                ? 'bg-canvas-light dark:bg-canvas-dark font-medium text-textPrimary-light dark:text-textPrimary-dark shadow-xs'
                : 'text-textMuted-light dark:text-textMuted-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{t('edit')}</span>
          </button>
          <button
            onClick={() => onViewModeChange('diff')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-colors ${
              viewMode === 'diff'
                ? 'bg-canvas-light dark:bg-canvas-dark font-medium text-textPrimary-light dark:text-textPrimary-dark shadow-xs'
                : 'text-textMuted-light dark:text-textMuted-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{t('diff')}</span>
          </button>
        </div>

        {/* Live Analytics Button */}
        {onOpenAnalytics && (
          <button
            onClick={onOpenAnalytics}
            title={t('statsButton')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border-light dark:border-border-dark hover:border-orange-500 text-textPrimary-light dark:text-textPrimary-dark text-xs font-semibold bg-subtle-light dark:bg-subtle-dark transition-colors shadow-xs"
          >
            <Activity className="w-3.5 h-3.5 text-orange-500" />
            <span className="hidden xl:inline">Stats</span>
          </button>
        )}

        {/* Git Branch Selector Dropdown */}
        <div className="relative" ref={branchMenuRef}>
          <button
            onClick={() => setBranchMenuOpen(!branchMenuOpen)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-border-light dark:border-border-dark bg-subtle-light dark:bg-subtle-dark hover:border-neutral-400 dark:hover:border-neutral-600 text-xs font-mono text-textPrimary-light dark:text-textPrimary-dark transition-colors"
          >
            <GitBranch className="w-3.5 h-3.5 text-orange-500" />
            <span>{branch}</span>
            <ChevronDown className="w-3 h-3 text-textMuted-light dark:text-textMuted-dark" />
          </button>

          {branchMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 rounded-xl border border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark shadow-xl py-1 z-50 text-xs">
              <div className="px-3 py-1 text-[10px] font-semibold text-textMuted-light dark:text-textMuted-dark uppercase tracking-wider">
                Git Branches
              </div>
              {branches.map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    setBranchMenuOpen(false);
                    if (onSelectBranch) onSelectBranch(b);
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left font-mono"
                >
                  <span>{b}</span>
                  {b === branch && <Check className="w-3 h-3 text-emerald-500" />}
                </button>
              ))}
              <div className="border-t border-border-light dark:border-border-dark mt-1 pt-1">
                <button
                  onClick={() => {
                    setBranchMenuOpen(false);
                    const newBranch = prompt('Enter new Git branch name (e.g. staging, release-v2):');
                    if (newBranch && onCreateBranch) {
                      onCreateBranch(newBranch.trim());
                    }
                  }}
                  className="w-full flex items-center space-x-1.5 px-3 py-1.5 text-orange-600 dark:text-orange-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New Branch</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Export Dropdown Menu */}
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            title={t('exportButton')}
            className="p-1.5 rounded-lg border border-border-light dark:border-border-dark hover:bg-subtle-light dark:hover:bg-subtle-dark text-textMuted-light dark:text-textMuted-dark transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          {exportMenuOpen && (
            <div className="absolute right-0 mt-1 w-52 rounded-xl border border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark shadow-2xl py-1.5 z-50 text-xs animate-scaleIn">
              <div className="px-3 py-1 text-[10px] font-semibold text-textMuted-light dark:text-textMuted-dark uppercase tracking-wider border-b border-border-light dark:border-border-dark mb-1">
                Export Formats
              </div>

              {onExportDoc && (
                <button
                  onClick={() => {
                    setExportMenuOpen(false);
                    onExportDoc();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
                >
                  <FileDown className="w-3.5 h-3.5 text-orange-500" />
                  <span>Download Markdown (.mdx)</span>
                </button>
              )}

              {onExportPdf && (
                <button
                  onClick={() => {
                    setExportMenuOpen(false);
                    onExportPdf();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-500" />
                  <span>Printable Clean PDF</span>
                </button>
              )}

              {onExportBook && (
                <button
                  onClick={() => {
                    setExportMenuOpen(false);
                    onExportBook();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left border-t border-border-light dark:border-border-dark mt-1 pt-1"
                >
                  <Archive className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Export Entire Book (.json)</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 5-Language Switcher */}
        <LanguageSelector />

        {/* Dark / Light Toggle */}
        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="p-1.5 rounded-lg border border-border-light dark:border-border-dark hover:bg-subtle-light dark:hover:bg-subtle-dark text-textMuted-light dark:text-textMuted-dark transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
