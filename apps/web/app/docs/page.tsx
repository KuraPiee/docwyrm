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
import { Loader2, ArrowLeft, Plus, Book, X, AlertTriangle } from 'lucide-react';
import { getActiveTheme, ThemeId, applyTheme } from '@/lib/theme';
import { saveSession } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const DEFAULT_BOOK_ID = 'docwyrm-developer-guide';

interface SpaceItem {
  id: string;
  title: string;
  slug: string;
  gitBranch: string;
}

export default function DocsPage() {
  const [spaces, setSpaces] = useState<SpaceItem[]>([]);
  const [activeSpaceId, setActiveSpaceId] = useState<string>(DEFAULT_BOOK_ID);
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
  const [isLoadingDoc, setIsLoadingDoc] = useState(true);
  const [branch, setBranch] = useState<string>('main');
  const [branches, setBranches] = useState<string[]>(['main', 'drafts']);
  const [activeTheme, setActiveTheme] = useState<ThemeId>('default');

  // Modals for Free Tier 3-Book Limit, Section creation, and Analytics
  const [isNewBookModalOpen, setIsNewBookModalOpen] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookError, setNewBookError] = useState<string | null>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  // Capture GitHub OAuth success redirect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'success') {
      const user = params.get('user') || 'Docwyrm User';
      const avatar = params.get('avatar') || `https://github.com/${user}.png`;
      const email = params.get('email') || `${user.toLowerCase()}@users.noreply.github.com`;
      saveSession({
        name: user,
        email: email,
        avatarUrl: avatar,
        provider: 'github',
        plan: 'free_unlimited',
      });
      // Clean query parameters from URL without reloading
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  // Sync dark class on <html>
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Listen to theme changes in Studio
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

  // 1. Fetch Spaces / Books
  const fetchSpaces = async () => {
    try {
      const res = await fetch(`${API_URL}/api/spaces`);
      if (res.ok) {
        const data = await res.json();
        const loadedSpaces = data.spaces || (Array.isArray(data) ? data : []);
        setSpaces(loadedSpaces);
        if (loadedSpaces.length > 0 && !activeSpaceId) {
          setActiveSpaceId(loadedSpaces[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching spaces:', err);
    }
  };

  // 2. Fetch Tree for Active Space
  const fetchTree = async (spaceId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/spaces/${spaceId}/tree`);
      if (res.ok) {
        const data = await res.json();
        const nodes: DocNode[] = data.tree || [];
        setTree(nodes);

        // Auto-select first document if current activeFilePath is empty or invalid
        if (nodes.length > 0 && !activeFilePath) {
          const findFirstDoc = (list: DocNode[]): string | null => {
            for (const n of list) {
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

  // 3. Fetch Branches for Active Space
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

  // 4. Fetch Doc Data
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

  // Initial Load
  useEffect(() => {
    fetchSpaces();
  }, []);

  // When active space changes, load its tree, branches, and docs
  useEffect(() => {
    if (activeSpaceId) {
      setActiveFilePath('');
      fetchTree(activeSpaceId);
      fetchBranches(activeSpaceId);
    }
  }, [activeSpaceId]);

  // When active file changes, load it
  useEffect(() => {
    if (activeSpaceId && activeFilePath) {
      fetchDoc(activeSpaceId, activeFilePath);
    }
  }, [activeSpaceId, activeFilePath]);

  // Handle Save from BlockEditor
  const handleSaveDoc = async (blocks: EditorBlock[], message: string) => {
    if (!activeSpaceId || !activeFilePath) return;
    const res = await fetch(`${API_URL}/api/spaces/${activeSpaceId}/docs/${activeFilePath}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blocks,
        message,
        author: { name: 'Docwyrm Team (@KuraPiee)', email: 'kurapiee@docwyrm.com' },
      }),
    });

    if (res.ok) {
      await fetchDoc(activeSpaceId, activeFilePath);
      await fetchTree(activeSpaceId);
    }
  };

  // Handle Delete Document
  const handleDeleteDoc = async (filePath: string) => {
    if (!activeSpaceId) return;
    try {
      const res = await fetch(`${API_URL}/api/spaces/${activeSpaceId}/docs/${filePath}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchTree(activeSpaceId);
        setActiveFilePath('');
        setViewMode('read');
      }
    } catch (err) {
      console.error('Failed to delete doc:', err);
    }
  };

  // Handle Create New Document / Sub-Page
  const handleNewDoc = async (parentSection?: string) => {
    if (!activeSpaceId) return;
    const pageTitle = prompt(
      parentSection
        ? `Enter sub-page title for "${parentSection}" (e.g. Authentication):`
        : 'Enter document title (e.g. Quickstart Guide):'
    );
    if (!pageTitle || !pageTitle.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/spaces/${activeSpaceId}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: parentSection,
          pageTitle: pageTitle.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        await fetchTree(activeSpaceId);
        if (data.filePath) {
          setActiveFilePath(data.filePath);
          setViewMode('edit');
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create document.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Create New Section / Chapter
  const handleNewSection = async () => {
    if (!activeSpaceId) return;
    const sectionName = prompt('Enter section/chapter name (e.g. 06-advanced-features):');
    if (!sectionName || !sectionName.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/spaces/${activeSpaceId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionName: sectionName.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        await fetchTree(activeSpaceId);
        if (data.initialDoc) {
          setActiveFilePath(data.initialDoc);
          setViewMode('edit');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Create New Book (Enforces Free Tier 3-Book Limit)
  const handleCreateBook = async () => {
    if (spaces.length >= 3) {
      setNewBookError('Free Tier limit reached. You can create up to 3 documentation books. Please delete an existing book to create a new one.');
      return;
    }

    if (!newBookTitle.trim()) {
      setNewBookError('Book title is required.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/spaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newBookTitle.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsNewBookModalOpen(false);
        setNewBookTitle('');
        setNewBookError(null);
        await fetchSpaces();
        if (data.space?.id) {
          setActiveSpaceId(data.space.id);
        }
      } else {
        const err = await res.json();
        setNewBookError(err.error || 'Failed to create book.');
      }
    } catch (e) {
      setNewBookError('Connection to API failed.');
    }
  };

  // Handle Branch Switch
  const handleSelectBranch = async (targetBranch: string) => {
    if (!activeSpaceId) return;
    try {
      const res = await fetch(`${API_URL}/api/spaces/${activeSpaceId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchName: targetBranch }),
      });
      if (res.ok) {
        setBranch(targetBranch);
        await fetchTree(activeSpaceId);
        if (activeFilePath) {
          await fetchDoc(activeSpaceId, activeFilePath);
        }
      }
    } catch (err) {
      console.error('Failed to switch branch:', err);
    }
  };

  // Handle Create Branch
  const handleCreateBranch = async (newBranch: string) => {
    if (!activeSpaceId) return;
    try {
      const res = await fetch(`${API_URL}/api/spaces/${activeSpaceId}/branches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchName: newBranch }),
      });
      if (res.ok) {
        setBranches((prev) => Array.from(new Set([...prev, newBranch])));
        await handleSelectBranch(newBranch);
      }
    } catch (err) {
      console.error('Failed to create branch:', err);
    }
  };

  // Handle Export current document
  const handleExportDoc = () => {
    if (!docData) return;
    const blob = new Blob([docData.rawContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFilePath || 'document.mdx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activeSpace = spaces.find((s) => s.id === activeSpaceId) || {
    id: DEFAULT_BOOK_ID,
    title: 'Docwyrm Developer Guide & SDK',
    slug: 'developer-guide',
  };

  return (
    <div
      className="studio-scope min-h-screen flex flex-col bg-canvas-light dark:bg-canvas-dark text-textPrimary-light dark:text-textPrimary-dark"
      data-theme={activeTheme}
    >
      {/* Top Banner linking back to Landing */}
      <div className="bg-neutral-100 dark:bg-neutral-900 border-b border-border-light dark:border-border-dark px-4 py-1.5 flex items-center justify-between text-xs">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-textMuted-light dark:text-textMuted-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <div className="flex items-center gap-3 text-textMuted-light dark:text-textMuted-dark text-[11px]">
          <span className="font-medium text-orange-600 dark:text-orange-400">
            Free Tier: {spaces.length} / 3 Books Active
          </span>
          <span>&bull;</span>
          <Link href="/marketplace" className="hover:underline">
            Themes & Plugins Marketplace
          </Link>
        </div>
      </div>

      {/* Studio Header */}
      <Header
        spaceTitle={activeSpace.title}
        spaces={spaces}
        activeSpaceId={activeSpaceId}
        onSelectSpace={(id) => setActiveSpaceId(id)}
        onCreateSpace={() => {
          if (spaces.length >= 3) {
            alert('Free Tier Limit Reached: You can create up to 3 documentation books. Please delete an existing book to create a new one.');
          } else {
            setIsNewBookModalOpen(true);
          }
        }}
        branch={branch}
        synced={true}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenSearch={() => setIsSearchOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        branches={branches}
        onSelectBranch={handleSelectBranch}
        onCreateBranch={handleCreateBranch}
        onExportDoc={() => docData && exportSingleDocAsMarkdown(docData.title, docData.blocks, activeFilePath)}
        onExportPdf={() => printCleanDocument()}
        onExportBook={() => exportFullBook(API_URL, activeSpaceId)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
      />

      {/* Main Studio Body: 3-Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Doc Tree Navigation (Sections & Sub-pages) */}
        <SidebarTree
          tree={tree}
          activeFilePath={activeFilePath}
          onSelectDoc={(fp) => setActiveFilePath(fp)}
          onNewDoc={handleNewDoc}
          onNewSection={handleNewSection}
          onDeleteDoc={handleDeleteDoc}
        />

        {/* Center Canvas: Reader, Block Editor, or Diff */}
        <main className="flex-1 overflow-y-auto p-6 md:p-12 flex justify-center bg-canvas-light dark:bg-canvas-dark transition-colors">
          <div className="w-full max-w-3xl">
            {isLoadingDoc ? (
              <div className="flex items-center justify-center h-64 text-textMuted-light dark:text-textMuted-dark">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500 mr-2" />
                <span>Loading Git document...</span>
              </div>
            ) : !docData ? (
              <div className="text-center py-20 text-textMuted-light dark:text-textMuted-dark">
                <h3 className="text-base font-semibold mb-2">No Document Selected</h3>
                <p className="text-xs mb-4">Choose a page from the table of contents on the left or create a new one.</p>
                <button
                  onClick={() => handleNewDoc()}
                  className="px-3 py-1.5 rounded-lg bg-orange-600 text-white font-medium text-xs hover:bg-orange-700 transition-colors"
                >
                  Create First Page
                </button>
              </div>
            ) : viewMode === 'read' ? (
              <DocReader
                title={docData.title}
                blocks={docData.blocks}
                filePath={activeFilePath}
                spaceId={activeSpaceId}
                apiUrl={API_URL}
              />
            ) : viewMode === 'edit' ? (
              <BlockEditor
                initialBlocks={docData.blocks}
                filePath={activeFilePath}
                onSave={handleSaveDoc}
              />
            ) : (
              <VersionHistoryDiff
                spaceId={activeSpaceId}
                filePath={activeFilePath}
                apiUrl={API_URL}
              />
            )}
          </div>
        </main>

        {/* Right Pane: Table of Contents */}
        {docData && (
          <TableOfContents
            blocks={docData.blocks}
            docTitle={docData.title}
            filePath={activeFilePath}
          />
        )}
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        spaceId={activeSpaceId}
        apiUrl={API_URL}
        onSelectResult={(fp) => {
          setActiveFilePath(fp);
          setIsSearchOpen(false);
        }}
      />

      {/* Analytics & Stats Modal */}
      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        spaceId={activeSpaceId}
        apiUrl={API_URL}
      />

      {/* Create New Book Modal (Enforces Free Tier 3-Book Limit) */}
      {isNewBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl border border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark p-6 shadow-2xl space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-3">
              <div className="flex items-center gap-2">
                <Book className="w-5 h-5 text-orange-600" />
                <h3 className="text-sm font-bold text-textPrimary-light dark:text-textPrimary-dark">
                  Create Documentation Book ({spaces.length + 1} of 3)
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsNewBookModalOpen(false);
                  setNewBookError(null);
                }}
                className="p-1 rounded-lg text-textMuted-light dark:text-textMuted-dark hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-textMuted-light dark:text-textMuted-dark">
                The Free Tier allows up to 3 independent documentation books. Each book has its own Git repository, sections, and nested sub-pages.
              </p>

              <div>
                <label className="block font-semibold mb-1">Book Title</label>
                <input
                  type="text"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  placeholder="e.g. Internal Developer Handbook"
                  className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark text-xs focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              {newBookError && (
                <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{newBookError}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsNewBookModalOpen(false);
                  setNewBookError(null);
                }}
                className="px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBook}
                className="px-4 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 transition-colors shadow-xs"
              >
                Create Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
