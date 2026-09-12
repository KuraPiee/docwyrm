'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Github, CheckCircle2, ArrowRight, Lock, Mail, User, Building, Loader2, Sparkles } from 'lucide-react';
import { saveSession, UserSession } from '@/lib/session';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
  onAuthSuccess?: (session: UserSession) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  initialTab = 'register',
  onAuthSuccess,
}: AuthModalProps) {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSuccessfulAuth = (userData: Partial<UserSession>) => {
    const session = saveSession({
      ...userData,
      plan: 'free_unlimited',
    });
    if (onAuthSuccess) {
      onAuthSuccess(session);
    }
    setIsLoading(false);
    setIsSuccess(true);
    setTimeout(() => {
      onClose();
      setIsSuccess(false);
      window.location.href = '/docs';
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      handleSuccessfulAuth({
        name: name || (tab === 'login' ? 'Docwyrm Team' : (email ? email.split('@')[0] : 'Docwyrm Team')),
        email: email || 'eren@docwyrm.dev',
        avatarUrl: 'https://github.com/KuraPiee.png',
        provider: 'email',
      });
    }, 400);
  };

  const handleGitHubAuth = () => {
    setIsLoading(true);
    setInfoMessage('GitHub doğrulanıyor, Sınırsız Free Tier hesabınız aktif ediliyor...');

    setTimeout(() => {
      handleSuccessfulAuth({
        name: 'Docwyrm Team',
        email: 'eren@docwyrm.dev',
        avatarUrl: 'https://github.com/KuraPiee.png',
        provider: 'github',
      });
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-canvas-light dark:bg-canvas-dark border border-border-light dark:border-border-dark rounded-xl shadow-2xl p-6 sm:p-8 text-textPrimary-light dark:text-textPrimary-dark"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-textMuted-light dark:text-textMuted-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3 animate-scaleIn">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold tracking-tight">
              {tab === 'login' ? 'Tekrar Hoş Geldiniz!' : 'Sınırsız Free Tier Aktif Edildi!'}
            </h3>
            <p className="text-xs text-textMuted-light dark:text-textMuted-dark">
              Ömür boyu sınırsız kullanım ile Docwyrm Studio&apos;ya aktarılıyorsunuz...
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold flex items-center justify-center text-sm">
                  DW
                </div>
                <span className="font-semibold text-lg tracking-tight">Docwyrm</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                {tab === 'login' ? 'Hesabınıza Giriş Yapın' : 'Sınırsız Free Tier Hesabı Açın'}
              </h2>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <Sparkles className="w-3 h-3" />
                <span>Kredi Kartı Yok &bull; Ömür Boyu Sınırsız &bull; %100 Açık Kaynak</span>
              </div>
            </div>

            <div className="flex border-b border-border-light dark:border-border-dark mb-5">
              <button
                type="button"
                onClick={() => setTab('register')}
                className={`flex-1 py-2 text-xs font-medium border-b-2 transition-colors ${
                  tab === 'register'
                    ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-bold'
                    : 'border-transparent text-textMuted-light dark:text-textMuted-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark'
                }`}
              >
                Sınırsız Free Kayıt Ol
              </button>
              <button
                type="button"
                onClick={() => setTab('login')}
                className={`flex-1 py-2 text-xs font-medium border-b-2 transition-colors ${
                  tab === 'login'
                    ? 'border-neutral-900 dark:border-white text-neutral-900 dark:text-white font-bold'
                    : 'border-transparent text-textMuted-light dark:text-textMuted-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark'
                }`}
              >
                Giriş Yap
              </button>
            </div>

            <div className="space-y-2.5 mb-5">
              <button
                onClick={handleGitHubAuth}
                disabled={isLoading}
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-lg text-xs font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Github className="w-4 h-4" />
                )}
                <span>GitHub ile Devam Et (Sınırsız Free)</span>
              </button>
              {infoMessage && (
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 leading-snug">
                  {infoMessage}
                </div>
              )}
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-light dark:border-border-dark" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-canvas-light dark:bg-canvas-dark px-2 text-textMuted-light dark:text-textMuted-dark font-mono">
                  veya e-posta ile
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {tab === 'register' && (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-textMuted-light dark:text-textMuted-dark mb-1">
                      Ad Soyad
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-textMuted-light dark:text-textMuted-dark" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Eren Özdemir"
                        className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border-light dark:border-border-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-textMuted-light dark:text-textMuted-dark mb-1">
                      Takım / Şirket Adı (İsteğe bağlı)
                    </label>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 absolute left-3 top-2.5 text-textMuted-light dark:text-textMuted-dark" />
                      <input
                        type="text"
                        value={org}
                        onChange={(e) => setOrg(e.target.value)}
                        placeholder="Docwyrm Engineering"
                        className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border-light dark:border-border-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 text-xs"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-medium text-textMuted-light dark:text-textMuted-dark mb-1">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-textMuted-light dark:text-textMuted-dark" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="eren@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border-light dark:border-border-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-medium text-textMuted-light dark:text-textMuted-dark">
                    Şifre
                  </label>
                  {tab === 'login' && (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Şifre sıfırlama bağlantısı gönderildi: ' + (email || 'e-postanız'));
                      }}
                      className="text-[10px] text-textMuted-light dark:text-textMuted-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark hover:underline"
                    >
                      Şifremi unuttum?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-textMuted-light dark:text-textMuted-dark" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-border-light dark:border-border-dark rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>İşleniyor...</span>
                  </>
                ) : (
                  <>
                    <span>{tab === 'login' ? 'Giriş Yap ve Stüdyoya Geç' : 'Sınırsız Free Hesabımı Aç'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-border-light dark:border-border-dark text-center text-[11px] text-textMuted-light dark:text-textMuted-dark">
              {tab === 'register' ? (
                <span>
                  Zaten hesabınız var mı?{' '}
                  <button
                    onClick={() => setTab('login')}
                    className="font-medium text-textPrimary-light dark:text-textPrimary-dark hover:underline"
                  >
                    Giriş yap
                  </button>
                </span>
              ) : (
                <span>
                  Henüz hesabınız yok mu?{' '}
                  <button
                    onClick={() => setTab('register')}
                    className="font-medium text-textPrimary-light dark:text-textPrimary-dark hover:underline"
                  >
                    Sınırsız Free Kaydolun
                  </button>
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
