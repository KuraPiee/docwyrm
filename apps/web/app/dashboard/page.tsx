'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Book,
  Plus,
  Lock,
  Globe,
  Trash2,
  Copy,
  Check,
  Search,
  AlertTriangle,
  Sparkles,
  Key,
  X,
  BookOpen,
  Moon,
  Sun
} from 'lucide-react';
import { getSession, UserSession } from '@/lib/session';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useI18n } from '@/lib/i18n';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://docwyrm.com';

interface SpaceItem {
  id: string;
  slug: string;
  title: string;
  description?: string;
  isPrivate?: boolean;
  hasPassword?: boolean;
  isSystemProtected?: boolean;
  gitBranch?: string;
  lastSyncedAt?: string;
}

export default function DashboardPage() {
  const { t } = useI18n();
  const [session, setSession] = useState<UserSession | null>(null);
  const [spaces, setSpaces] = useState<SpaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  // Creation modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isAutoSlug, setIsAutoSlug] = useState(true);
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState<SpaceItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Copy notification
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Initial mount
  useEffect(() => {
    const s = getSession();
    if (s) setSession(s);
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/spaces`);
      if (res.ok) {
        const data = await res.json();
        setSpaces(data.spaces || []);
      }
    } catch (e) {
      console.error('Failed to fetch spaces:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (isAutoSlug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generated);
    }
  };

  const handleSlugChange = (val: string) => {
    setIsAutoSlug(false);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
    );
  };

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (spaces.length >= 3) {
      setCreateError('Free Tier limit reached. You can create up to 3 documentation books.');
      return;
    }
    if (!title.trim()) {
      setCreateError('Book title is required.');
      return;
    }
    if (!slug.trim()) {
      setCreateError('URL Slug is required.');
      return;
    }
    if (isPrivate && (!password || password.trim().length < 3)) {
      setCreateError('Password for private books must be at least 3 characters.');
      return;
    }

    setIsSubmitting(true);
    setCreateError(null);

    try {
      const res = await fetch(`${API_URL}/api/spaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          isPrivate,
          password: isPrivate ? password.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || 'Failed to create project.');
        return;
      }

      setIsCreateOpen(false);
      resetForm();
      await fetchSpaces();

      // Navigate to the newly created book
      const targetSlug = data.space?.slug || slug.trim();
      window.location.href = `/${targetSlug}`;
    } catch (err) {
      setCreateError('Failed to connect to API server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSpace = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/spaces/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeleteTarget(null);
        await fetchSpaces();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete book');
      }
    } catch (e) {
      alert('Network error while deleting book');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyLink = (targetSlug: string) => {
    const fullUrl = `https://docwyrm.com/${targetSlug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(targetSlug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setIsAutoSlug(true);
    setDescription('');
    setIsPrivate(false);
    setPassword('');
    setCreateError(null);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const filteredSpaces = spaces.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = spaces.length;
  const maxAllowed = 3;
  const isLimitReached = activeCount >= maxAllowed;

  return (
    <div className="min-h-screen flex flex-col bg-canvas-light dark:bg-canvas-dark text-textPrimary-light dark:text-textPrimary-dark selection:bg-orange-500/20 transition-colors">
      {/* Top Navbar */}
      <header className="h-14 border-b border-border-light dark:border-border-dark bg-canvas-light/80 dark:bg-canvas-dark/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="flex items-center space-x-2 font-semibold text-sm tracking-tight hover:opacity-85 transition-opacity"
          >
            <div className="w-6 h-6 rounded-lg bg-orange-600 flex items-center justify-center text-white text-xs font-mono font-bold shadow-xs">
              DW
            </div>
            <span className="font-bold text-base">Docwyrm</span>
          </Link>
          <span className="text-textMuted-light dark:text-textMuted-dark">/</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-textMuted-light dark:text-textMuted-dark">
            Projects Hub
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <LanguageSelector />
          <button
            onClick={toggleTheme}
            className="p-2 text-textMuted-light dark:text-textMuted-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {session ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-border-light dark:border-border-dark">
              <img
                src={session.avatarUrl || 'https://github.com/KuraPiee.png'}
                alt={session.name}
                className="w-7 h-7 rounded-full border border-orange-500/60 object-cover"
              />
              <div className="hidden sm:block text-left text-xs leading-tight">
                <div className="font-semibold truncate max-w-[120px]">{session.name}</div>
                <div className="text-[10px] text-textMuted-light dark:text-textMuted-dark font-mono">
                  @KuraPiee
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/"
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Back to Home
            </Link>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Welcome & Quota Card */}
        <div className="rounded-2xl border border-border-light dark:border-border-dark bg-subtle-light/40 dark:bg-subtle-dark/40 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 max-w-xl z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free Community Plan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Documentation Projects & Books
            </h1>
            <p className="text-xs sm:text-sm text-textMuted-light dark:text-textMuted-dark leading-relaxed">
              Her dökümantasyon kitabı doğrudan kendi domain linkine (<span className="font-mono text-orange-600 dark:text-orange-400">docwyrm.com/projeadı</span>) bağlanır. İsteğe göre özel ve şifreli olarak korunabilir.
            </p>
          </div>

          {/* Meter & Action */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 z-10">
            <div className="bg-canvas-light dark:bg-canvas-dark border border-border-light dark:border-border-dark rounded-xl p-3.5 w-full sm:w-60 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-textMuted-light dark:text-textMuted-dark">
                  Book Quota
                </span>
                <span className="font-bold font-mono text-orange-600 dark:text-orange-400">
                  {activeCount} / {maxAllowed} Books
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isLimitReached ? 'bg-amber-500' : 'bg-orange-600'
                  }`}
                  style={{ width: `${(activeCount / maxAllowed) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-textMuted-light dark:text-textMuted-dark">
                {isLimitReached
                  ? 'Limit reached. Delete an existing book to create a new one.'
                  : `${maxAllowed - activeCount} book slot${maxAllowed - activeCount > 1 ? 's' : ''} available on Free Tier.`}
              </div>
            </div>

            <button
              onClick={() => {
                if (isLimitReached) {
                  alert('Free Tier limit reached. You can have up to 3 documentation books active.');
                  return;
                }
                setCreateError(null);
                setIsCreateOpen(true);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Proje / Kitap Oluştur</span>
            </button>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted-light dark:text-textMuted-dark" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Proje veya kitap ara..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark text-textPrimary-light dark:text-textPrimary-dark focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="py-20 text-center text-xs text-textMuted-light dark:text-textMuted-dark">
            Projeler yükleniyor...
          </div>
        ) : filteredSpaces.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-border-light dark:border-border-dark rounded-2xl p-8 space-y-3">
            <BookOpen className="w-8 h-8 mx-auto text-textMuted-light dark:text-textMuted-dark opacity-40" />
            <div className="font-semibold text-sm">Henüz bir proje bulunamadı</div>
            <p className="text-xs text-textMuted-light dark:text-textMuted-dark max-w-sm mx-auto">
              Yeni bir dökümantasyon kitabı oluşturarak başlayabilir ve dökümanlarınızı Git ile senkronize edebilirsiniz.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Proje Oluştur</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSpaces.map((space) => {
              const relativeUrl = `/${space.slug}`;

              return (
                <div
                  key={space.id}
                  className="rounded-2xl border border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark hover:border-orange-500/50 dark:hover:border-orange-500/50 transition-all p-5 flex flex-col justify-between shadow-xs hover:shadow-md group"
                >
                  <div className="space-y-3">
                    {/* Header: Title & Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <h3 className="font-bold text-sm truncate text-textPrimary-light dark:text-textPrimary-dark group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {space.title}
                        </h3>
                        {space.description && (
                          <p className="text-xs text-textMuted-light dark:text-textMuted-dark line-clamp-2 leading-relaxed">
                            {space.description}
                          </p>
                        )}
                      </div>

                      {/* Status badge */}
                      {space.isPrivate ? (
                        <span
                          className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 flex-shrink-0"
                          title="Şifreli & Özel Kitap"
                        >
                          <Lock className="w-2.5 h-2.5" />
                          <span>Private</span>
                        </span>
                      ) : (
                        <span
                          className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 flex-shrink-0"
                          title="Herkese Açık Kitap"
                        >
                          <Globe className="w-2.5 h-2.5" />
                          <span>Public</span>
                        </span>
                      )}
                    </div>

                    {/* Slug & Domain Link */}
                    <div className="rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-border-light dark:border-border-dark px-2.5 py-1.5 flex items-center justify-between text-[11px] font-mono">
                      <span className="truncate text-orange-600 dark:text-orange-400">
                        docwyrm.com/{space.slug}
                      </span>
                      <button
                        onClick={() => handleCopyLink(space.slug)}
                        className="text-textMuted-light dark:text-textMuted-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors flex-shrink-0 ml-1 cursor-pointer"
                        title="Copy Domain URL"
                      >
                        {copiedSlug === space.slug ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {space.isSystemProtected && (
                      <div className="text-[10px] font-medium text-textMuted-light dark:text-textMuted-dark flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-orange-500" />
                        <span>Core Official Developer Guide</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 mt-4 border-t border-border-light dark:border-border-dark flex items-center justify-between gap-2">
                    <Link
                      href={relativeUrl}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-orange-600 dark:bg-neutral-800 dark:hover:bg-orange-600 text-textPrimary-light dark:text-textPrimary-dark hover:text-white dark:hover:text-white text-xs font-semibold transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Kitabı Aç & Oku</span>
                    </Link>

                    {!space.isSystemProtected && (
                      <button
                        onClick={() => setDeleteTarget(space)}
                        className="p-1.5 rounded-lg text-textMuted-light dark:text-textMuted-dark hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Projeyi Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* CREATE NEW PROJECT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-canvas-light dark:bg-canvas-dark border border-border-light dark:border-border-dark rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center">
                  <Book className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Yeni Dökümantasyon Projesi</h3>
                  <p className="text-[11px] text-textMuted-light dark:text-textMuted-dark">
                    Free Tier: {activeCount}/3 aktif kitap
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-textMuted-light dark:text-textMuted-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSpace} className="space-y-4 text-xs">
              {/* Project Title */}
              <div className="space-y-1.5">
                <label className="font-semibold block">Proje / Kitap Adı *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="örn: E-Ticaret API Rehberi veya Oyun Dokümanı"
                  className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-subtle-light dark:bg-subtle-dark text-xs focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              {/* Custom Domain Slug */}
              <div className="space-y-1.5">
                <label className="font-semibold block">Domain URL Adresi (Slug) *</label>
                <div className="flex items-center rounded-lg border border-border-light dark:border-border-dark bg-subtle-light dark:bg-subtle-dark px-3 py-1.5 text-xs font-mono">
                  <span className="text-textMuted-light dark:text-textMuted-dark">
                    https://docwyrm.com/
                  </span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="projeadi"
                    className="flex-1 bg-transparent font-mono text-orange-600 dark:text-orange-400 font-bold focus:outline-hidden pl-0.5"
                  />
                </div>
                <p className="text-[10px] text-textMuted-light dark:text-textMuted-dark">
                  Dökümanınız bu link üzerinden doğrudan yayınlanacaktır.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="font-semibold block">Açıklama (İsteğe Bağlı)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Projeniz hakkında kısa bilgi..."
                  className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-subtle-light dark:bg-subtle-dark text-xs focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              {/* Privacy Setting: Public vs Private */}
              <div className="space-y-2 pt-1 border-t border-border-light dark:border-border-dark">
                <label className="font-semibold block">Erişim & Gizlilik</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPrivate(false)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      !isPrivate
                        ? 'border-orange-500 bg-orange-50/60 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 font-semibold'
                        : 'border-border-light dark:border-border-dark hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <Globe className="w-4 h-4 flex-shrink-0" />
                    <div>
                      <div className="text-xs">Herkese Açık</div>
                      <div className="text-[10px] text-textMuted-light dark:text-textMuted-dark font-normal">
                        Herkes okuyabilir
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPrivate(true)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isPrivate
                        ? 'border-orange-500 bg-orange-50/60 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 font-semibold'
                        : 'border-border-light dark:border-border-dark hover:bg-neutral-50 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <Lock className="w-4 h-4 flex-shrink-0" />
                    <div>
                      <div className="text-xs">Özel & Şifreli</div>
                      <div className="text-[10px] text-textMuted-light dark:text-textMuted-dark font-normal">
                        Şifre ile erişilir
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Password Input (If Private) */}
              {isPrivate && (
                <div className="space-y-1.5 p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 animate-scaleIn">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-800 dark:text-amber-300 text-xs">
                    <Key className="w-3.5 h-3.5" />
                    <span>Kitap Erişim Şifresi *</span>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="En az 3 karakterli şifre belirleyin"
                    className="w-full px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-800 bg-canvas-light dark:bg-canvas-dark text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-amber-700/80 dark:text-amber-400">
                    docwyrm.com/{slug || 'projeadi'} adresini ziyaret edenler dökümanı okumak için bu şifreyi girecek.
                  </p>
                </div>
              )}

              {/* Error Alert */}
              {createError && (
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border-light dark:border-border-dark">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-border-light dark:border-border-dark hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'Oluşturuluyor...' : 'Projeyi Yayınla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-canvas-light dark:bg-canvas-dark border border-border-light dark:border-border-dark rounded-2xl max-w-sm w-full shadow-2xl p-6 space-y-4 animate-scaleIn">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-sm">Projeyi Silmek İstiyor musunuz?</h3>
              <p className="text-xs text-textMuted-light dark:text-textMuted-dark">
                <span className="font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                  "{deleteTarget.title}"
                </span>{' '}
                ve tüm Git dökümanları kalıcı olarak silinecektir. Bu işlem 1 kitap kotanızı geri kazandırır.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-3 py-2 rounded-lg border border-border-light dark:border-border-dark hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold cursor-pointer"
              >
                Vazgeç
              </button>
              <button
                onClick={handleDeleteSpace}
                disabled={isDeleting}
                className="flex-1 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {isDeleting ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
