'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DocNode, EditorBlock } from '@docwyrm/types';
import { Header } from '@/components/Header';
import { SidebarTree } from '@/components/SidebarTree';
import { DocReader } from '@/components/DocReader';
import { BlockEditor } from '@/components/BlockEditor';
import { VersionHistoryDiff } from '@/components/VersionHistoryDiff';
import { TableOfContents } from '@/components/TableOfContents';
import { SearchModal } from '@/components/SearchModal';
import { AnalyticsModal } from '@/components/AnalyticsModal';
import { exportSingleDocAsMarkdown, printCleanDocument, exportFullBook } from '@/lib/export';
import {
  Loader2,
  ArrowLeft,
  Plus,
  Book,
  X,
  AlertTriangle,
  Lock,
  Key,
  ShieldCheck,
  Globe,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { getActiveTheme, ThemeId, applyTheme, resetGlobalTheme } from '@/lib/theme';
import { saveSession } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://docwyrm.com';

interface SpaceItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  isPrivate?: boolean;
  hasPassword?: boolean;
  isSystemProtected?: boolean;
  themeId?: string;
  gitBranch?: string;
}

export default function DynamicBookPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const [space, setSpace] = useState<SpaceItem | null>(null);
  const [spaces, setSpaces] = useState<SpaceItem[]>([]);
  const [isLoadingSpace, setIsLoadingSpace] = useState(true);
  const [spaceNotFound, setSpaceNotFound] = useState(false);

  // Password Protection Gate
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

  // Documentation Studio State
  const [tree, setTree] = useState<DocNode[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string>('');
  const [docData, setDocData] = useState<{
    title: string;
    blocks: EditorBlock[];
    rawContent: string;
  } | null>(null);
  const [viewMode, setViewMode] = useState<'read' | 'edit' | 'diff'>('read');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [branch, setBranch] = useState<string>('main');
  const [branches, setBranches] = useState<string[]>(['main', 'drafts']);
  const [activeTheme, setActiveTheme] = useState<ThemeId>('default');

  // Modals
  const [isNewBookModalOpen, setIsNewBookModalOpen] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookError, setNewBookError] = useState<string | null>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  // Sync dark class on <html>
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Listen to theme changes
  useEffect(() => {
    setActiveTheme(getActiveTheme());
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeId>;
      if (customEvent.detail) {
        setActiveTheme(customEvent.detail);
      }
    };
    window.addEventListener('docwyrm_theme_changed', handleThemeChange);
    return () => {
      window.removeEventListener('docwyrm_theme_changed', handleThemeChange);
      resetGlobalTheme();
    };
  }, []);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1. Fetch this Space by Slug and list of all spaces
  useEffect(() => {
    const loadSpaceData = async () => {
      setIsLoadingSpace(true);
      try {
        const [spaceRes, allSpacesRes] = await Promise.all([
          fetch(`${API_URL}/api/spaces/${slug}`),
          fetch(`${API_URL}/api/spaces`),
        ]);

        if (allSpacesRes.ok) {
          const allData = await allSpacesRes.json();
          setSpaces(allData.spaces || []);
        }

        if (!spaceRes.ok) {
          setSpaceNotFound(true);
          setIsLoadingSpace(false);
          return;
        }

        const data: SpaceItem = await spaceRes.json();
        setSpace(data);

        // Apply book's locked theme (defaults to classic)
        const bookTheme = (data.themeId as ThemeId) || 'default';
        applyTheme(bookTheme);
        setActiveTheme(bookTheme);

        // Check if unlocked in session storage
        if (!data.isPrivate || !data.hasPassword) {
          setIsUnlocked(true);
        } else {
          const savedToken = sessionStorage.getItem(`docwyrm_unlocked_${data.id}`);
          if (savedToken) {
            setIsUnlocked(true);
          }
        }
      } catch (err) {
        console.error('Failed to load space:', err);
        setSpaceNotFound(true);
      } finally {
        setIsLoadingSpace(false);
      }
    };

    loadSpaceData();
  }, [slug]);

  // 2. Fetch Tree and branches once unlocked
  useEffect(() => {
    if (space && isUnlocked) {
      fetchTree(space.id);
      fetchBranches(space.id);
    }
  }, [space, isUnlocked]);

  // 3. Fetch doc when active file path changes
  useEffect(() => {
    if (space && isUnlocked && activeFilePath) {
      fetchDoc(space.id, activeFilePath);
    }
  }, [space, isUnlocked, activeFilePath]);

  const fetchTree = async (spaceId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/spaces/${spaceId}/tree`);
      if (res.ok) {
        const data = await res.json();
        const nodes: DocNode[] = data.tree || [];
        setTree(nodes);

        // If no active file selected yet, select first leaf document
        if (!activeFilePath && nodes.length > 0) {
          const findFirstDoc = (items: DocNode[]): string | null => {
            for (const n of items) {
              if (n.children && n.children.length > 0) {
                const found = findFirstDoc(n.children);
                if (found) return found;
              } else if (n.filePath.endsWith('.md') || n.filePath.endsWith('.mdx')) {
                return n.filePath;
              }
            }
            return null;
          };
          const first = findFirstDoc(nodes);
          if (first) {
            setActiveFilePath(first);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching tree:', err);
    }
  };

  const fetchBranches = async (spaceId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/spaces/${spaceId}/branches`);
      if (res.ok) {
        const data = await res.json();
        if (data.branches) setBranches(data.branches);
        if (data.currentBranch) setBranch(data.currentBranch);
      }
    } catch (err) {
      console.error('Error fetching branches:', err);
    }
  };

  const fetchDoc = async (spaceId: string, filePath: string) => {
    if (!filePath) return;
    setIsLoadingDoc(true);
    try {
      const res = await fetch(`${API_URL}/api/spaces/${spaceId}/docs/${filePath}`);
      if (res.ok) {
        const data = await res.json();
        setDocData({
          title: data.title,
          blocks: data.blocks,
          rawContent: data.rawContent,
        });
      }
    } catch (err) {
      console.error('Error fetching doc:', err);
    } finally {
      setIsLoadingDoc(false);
    }
  };

  // Password verification handler
  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!space) return;

    setIsVerifyingPassword(true);
    setPasswordError(null);

    try {
      const res = await fetch(`${API_URL}/api/spaces/${space.id}/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: inputPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || 'Şifre hatalı. Lütfen tekrar deneyin.');
        return;
      }

      // Store in session storage
      sessionStorage.setItem(`docwyrm_unlocked_${space.id}`, data.token || 'verified');
      setIsUnlocked(true);
    } catch (err) {
      setPasswordError('Bağlantı hatası oluştu.');
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  // Handle Save from BlockEditor
  const handleSaveDoc = async (blocks: EditorBlock[], message: string) => {
    if (!space || !activeFilePath) return;
    const res = await fetch(`${API_URL}/api/spaces/${space.id}/docs/${activeFilePath}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blocks,
        message,
        author: { name: 'Docwyrm Team (@KuraPiee)', email: 'kurapiee@docwyrm.com' },
      }),
    });

    if (res.ok) {
      await fetchDoc(space.id, activeFilePath);
      await fetchTree(space.id);
    }
  };

  // Handle Delete Document
  const handleDeleteDoc = async (filePath: string) => {
    if (!space) return;
    if (space.isSystemProtected) {
      alert('Sistem geliştirici kılavuzundaki çekirdek dökümanlar silinemez.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/spaces/${space.id}/docs/${filePath}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchTree(space.id);
        setActiveFilePath('');
        setViewMode('read');
      } else {
        const err = await res.json();
        alert(err.error || 'Döküman silinemedi');
      }
    } catch (err) {
      console.error('Failed to delete doc:', err);
    }
  };

  // Handle Create New Document
  const handleNewDoc = async (parentSection?: string) => {
    if (!space) return;
    const pageTitle = prompt(
      parentSection
        ? `Enter sub-page title for "${parentSection}" (e.g. Authentication):`
        : 'Enter document title (e.g. Quickstart Guide):'
    );
    if (!pageTitle || !pageTitle.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/spaces/${space.id}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: parentSection,
          pageTitle: pageTitle.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        await fetchTree(space.id);
        if (data.filePath) {
          setActiveFilePath(data.filePath);
          setViewMode('edit');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Create Section
  const handleNewSection = async () => {
    if (!space) return;
    const sectionName = prompt('Enter Chapter / Section title (e.g. API Reference):');
    if (!sectionName || !sectionName.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/spaces/${space.id}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionName: sectionName.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        await fetchTree(space.id);
        if (data.initialDoc) {
          setActiveFilePath(data.initialDoc);
          setViewMode('edit');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Loading Screen
  if (isLoadingSpace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas-light dark:bg-canvas-dark text-textPrimary-light dark:text-textPrimary-dark">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-xs text-textMuted-light dark:text-textMuted-dark font-mono">
            Loading book: {slug}...
          </p>
        </div>
      </div>
    );
  }

  // 404 Screen
  if (spaceNotFound || !space) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-canvas-light dark:bg-canvas-dark text-textPrimary-light dark:text-textPrimary-dark p-6 space-y-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center mx-auto">
          <Book className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">Dökümantasyon Kitabı Bulunamadı</h1>
        <p className="text-xs text-textMuted-light dark:text-textMuted-dark max-w-sm">
          <span className="font-mono text-orange-600 dark:text-orange-400">docwyrm.com/{slug}</span> adresinde aktif bir dökümantasyon projesi mevcut değil veya silinmiş olabilir.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tüm Projeler (Dashboard)</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border-light dark:border-border-dark text-xs font-semibold"
          >
            <span>Ana Sayfa</span>
          </Link>
        </div>
      </div>
    );
  }

  // PASSWORD GATE SCREEN (If private & locked)
  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-canvas-light dark:bg-canvas-dark text-textPrimary-light dark:text-textPrimary-dark p-4 selection:bg-orange-500/20">
        <div className="w-full max-w-md rounded-2xl border border-border-light dark:border-border-dark bg-subtle-light/60 dark:bg-subtle-dark/60 backdrop-blur-xl p-8 shadow-2xl space-y-6 animate-scaleIn text-center relative overflow-hidden">
          {/* Top glowing lock */}
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-semibold">
              <ShieldCheck className="w-3 h-3" />
              <span>Özel ve Şifreli Dökümantasyon</span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-textPrimary-light dark:text-textPrimary-dark">
              {space.title}
            </h1>
            <p className="text-xs text-textMuted-light dark:text-textMuted-dark">
              Bu kitap parola ile korunmaktadır. Okumak veya düzenlemek için lütfen erişim şifresini girin.
            </p>
          </div>

          <form onSubmit={handleVerifyPassword} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="font-semibold text-xs flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                <span>Kitap Şifresi</span>
              </label>
              <input
                type="password"
                required
                autoFocus
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                placeholder="Parolanızı girin..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark text-xs focus:ring-2 focus:ring-orange-500 focus:outline-hidden shadow-xs"
              />
            </div>

            {passwordError && (
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 animate-scaleIn">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifyingPassword}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              {isVerifyingPassword ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Doğrulanıyor...</span>
                </>
              ) : (
                <>
                  <span>Kitabı Aç & Oku</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-border-light dark:border-border-dark">
            <Link
              href="/dashboard"
              className="text-xs text-textMuted-light dark:text-textMuted-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark transition-colors inline-flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tüm Projeler Paneline Dön</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // UNLOCKED DOCUMENTATION STUDIO VIEW
  return (
    <div className="min-h-screen flex flex-col bg-canvas-light dark:bg-canvas-dark text-textPrimary-light dark:text-textPrimary-dark selection:bg-orange-500/20 transition-colors">
      {/* Top Studio Header */}
      <Header
        spaceTitle={space.title}
        spaces={spaces}
        activeSpaceId={space.id}
        onSelectSpace={(targetId) => {
          const target = spaces.find((s) => s.id === targetId);
          if (target) {
            window.location.href = `/${target.slug}`;
          }
        }}
        onCreateSpace={() => (window.location.href = '/dashboard')}
        branch={branch}
        synced={true}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenSearch={() => setIsSearchOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        branches={branches}
        onSelectBranch={(targetBranch) => setBranch(targetBranch)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onExportBook={() => exportFullBook(space.id, space.title)}
      />

      {/* 3-Pane Doc Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Tree Navigation */}
        <SidebarTree
          tree={tree}
          activeFilePath={activeFilePath}
          onSelectDoc={(path) => setActiveFilePath(path)}
          onNewDoc={(parentSection) => handleNewDoc(parentSection)}
          onNewSection={handleNewSection}
          onDeleteDoc={!space.isSystemProtected ? handleDeleteDoc : undefined}
        />

        {/* Center: Content Body */}
        <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-10 lg:px-16 flex justify-center">
          <div className="w-full max-w-[780px]">
            {isLoadingDoc ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                <p className="text-xs text-textMuted-light dark:text-textMuted-dark font-mono">
                  Loading document from Git...
                </p>
              </div>
            ) : !docData ? (
              <div className="py-20 text-center space-y-3">
                <p className="text-textMuted-light dark:text-textMuted-dark text-xs">
                  Select a document from the sidebar to begin reading.
                </p>
              </div>
            ) : viewMode === 'read' ? (
              <DocReader
                title={docData.title}
                filePath={activeFilePath}
                blocks={docData.blocks}
                spaceId={space.id}
              />
            ) : viewMode === 'edit' ? (
              <BlockEditor
                initialBlocks={docData.blocks}
                filePath={activeFilePath}
                onSave={handleSaveDoc}
              />
            ) : (
              <VersionHistoryDiff
                spaceId={space.id}
                filePath={activeFilePath}
              />
            )}
          </div>
        </main>

        {/* Right: Table of Contents */}
        {viewMode === 'read' && docData && (
          <aside className="hidden xl:block w-[240px] border-l border-border-light dark:border-border-dark p-6 h-[calc(100vh-52px)] sticky top-[52px] select-none overflow-y-auto">
            <TableOfContents blocks={docData.blocks} />
          </aside>
        )}
      </div>

      {/* Global Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        spaceId={space.id}
        apiUrl={API_URL}
        onSelectResult={(fp) => {
          setActiveFilePath(fp);
          setIsSearchOpen(false);
        }}
      />

      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        spaceId={space.id}
        apiUrl={API_URL}
      />
    </div>
  );
}
