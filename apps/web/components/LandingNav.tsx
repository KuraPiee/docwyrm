'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Moon, Sun, Menu, X, ArrowRight, GitBranch, LogOut, ChevronDown, ShieldCheck, Sparkles, Store, ExternalLink, Github } from 'lucide-react';
import { UserSession } from '@/lib/session';
import { ThemeSelector } from './ThemeSelector';
import { LanguageSelector } from './LanguageSelector';

interface LandingNavProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  session: UserSession | null;
  onLogout: () => void;
}

export function LandingNav({
  onOpenLogin,
  onOpenRegister,
  isDark,
  onToggleTheme,
  session,
  onLogout,
}: LandingNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userAvatar = session?.avatarUrl || 'https://github.com/KuraPiee.png';
  const userName = session?.name || 'Docwyrm Team';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-light dark:border-border-dark bg-canvas-light/90 dark:bg-canvas-dark/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Main Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105">
              <GitBranch className="w-4 h-4 text-orange-500" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-textPrimary-light dark:text-textPrimary-dark">
              Docwyrm
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-textMuted-light dark:text-textMuted-dark">
            <a
              href="#features"
              className="hover:text-textPrimary-light dark:hover:text-textPrimary-dark transition-colors"
            >
              Product
            </a>
            <a
              href="#diff-engine"
              className="hover:text-textPrimary-light dark:hover:text-textPrimary-dark transition-colors"
            >
              Git Engine
            </a>
            <a
              href="#comparison"
              className="hover:text-textPrimary-light dark:hover:text-textPrimary-dark transition-colors"
            >
              Why Docwyrm
            </a>
            <Link
              href="/marketplace"
              className="hover:text-textPrimary-light dark:hover:text-textPrimary-dark transition-colors flex items-center gap-1 text-orange-600 dark:text-orange-400 font-semibold"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Marketplace</span>
              <span className="text-[10px] bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 px-1.5 py-0.2 rounded font-mono">
                New
              </span>
            </Link>
            <a
              href="#pricing"
              className="hover:text-textPrimary-light dark:hover:text-textPrimary-dark transition-colors"
            >
              Pricing
            </a>
            <Link
              href="/docs"
              className="hover:text-textPrimary-light dark:hover:text-textPrimary-dark transition-colors flex items-center gap-1"
            >
              <span>Documentation</span>
              <span className="text-[10px] bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-mono">
                /docs
              </span>
            </Link>
          </nav>
        </div>

        {/* Right Controls */}
        <div className="hidden sm:flex items-center gap-3">

          {/* GitHub Profile */}
          <a
            href="https://github.com/KuraPiee"
            target="_blank"
            rel="noreferrer"
            className="p-2 text-textMuted-light dark:text-textMuted-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Docwyrm GitHub Profile (@KuraPiee)"
          >
            <Github className="w-4 h-4" />
          </a>

          {/* 5-Language Switcher */}
          <LanguageSelector />

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 text-textMuted-light dark:text-textMuted-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Toggle color mode"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {session ? (
            /* Logged-in state with actual GitHub profile photo */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-border-light dark:border-border-dark bg-neutral-50 dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all text-xs font-medium"
              >
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-6 h-6 rounded-full border border-orange-500/60 object-cover"
                />
                <span className="text-textPrimary-light dark:text-textPrimary-dark font-medium max-w-[120px] truncate">
                  {userName}
                </span>
                <ChevronDown className="w-3 h-3 text-textMuted-light dark:text-textMuted-dark" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark shadow-xl py-2 text-xs animate-scaleIn z-50">
                  <div className="px-3.5 py-2.5 border-b border-border-light dark:border-border-dark space-y-1">
                    <div className="font-semibold text-textPrimary-light dark:text-textPrimary-dark truncate flex items-center gap-1.5">
                      <span>{userName}</span>
                      <span className="text-[10px] font-mono text-textMuted-light dark:text-textMuted-dark">(@KuraPiee)</span>
                    </div>
                    <div className="text-[11px] text-textMuted-light dark:text-textMuted-dark truncate">
                      {session.email || 'eren@docwyrm.dev'}
                    </div>
                    <div className="pt-1 flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Unlimited Community Tier (Free Forever)</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/docs"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center justify-between px-3.5 py-2 text-textPrimary-light dark:text-textPrimary-dark hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <span className="font-medium">Open Studio Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5 text-orange-500" />
                    </Link>
                    <Link
                      href="/marketplace"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center justify-between px-3.5 py-2 text-textPrimary-light dark:text-textPrimary-dark hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <span className="font-medium">Theme &amp; Plugin Marketplace</span>
                      <Store className="w-3.5 h-3.5 text-textMuted-light dark:text-textMuted-dark" />
                    </Link>
                    <a
                      href="https://github.com/KuraPiee"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between px-3.5 py-2 text-textPrimary-light dark:text-textPrimary-dark hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <span>GitHub Profile</span>
                      <ExternalLink className="w-3 h-3 text-textMuted-light dark:text-textMuted-dark" />
                    </a>
                  </div>

                  <div className="pt-1 border-t border-border-light dark:border-border-dark">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={onOpenLogin}
                className="text-xs font-medium text-textMuted-light dark:text-textMuted-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark px-3 py-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Log in
              </button>

              <button
                onClick={onOpenRegister}
                className="text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-3.5 py-1.5 rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-sm"
              >
                Start for free
              </button>
            </>
          )}

          <Link
            href="/docs"
            className="text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-1 shadow-sm"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="p-2 text-textMuted-light dark:text-textMuted-dark rounded-md"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-textMuted-light dark:text-textMuted-dark rounded-md"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark px-4 pt-3 pb-6 space-y-3 text-sm">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 text-textMuted-light dark:text-textMuted-dark"
          >
            Product
          </a>
          <a
            href="#diff-engine"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 text-textMuted-light dark:text-textMuted-dark"
          >
            Git Engine
          </a>
          <Link
            href="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 text-orange-600 font-semibold"
          >
            Marketplace (Themes &amp; Plugins)
          </Link>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 text-textMuted-light dark:text-textMuted-dark"
          >
            Pricing
          </a>
          <Link
            href="/docs"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 text-textMuted-light dark:text-textMuted-dark"
          >
            Documentation (/docs)
          </Link>

          {session ? (
            <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-7 h-7 rounded-full border border-orange-500"
                />
                <div>
                  <div className="font-semibold text-xs text-textPrimary-light dark:text-textPrimary-dark">
                    {userName}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Unlimited Free Tier
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="text-xs text-red-500 font-medium"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="w-full text-center py-2 text-xs font-medium border border-border-light dark:border-border-dark rounded-md"
              >
                Log in
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRegister();
                }}
                className="w-full text-center py-2 text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-md"
              >
                Start for free
              </button>
            </div>
          )}

          <Link
            href="/docs"
            className="w-full text-center py-2 text-xs font-semibold bg-orange-600 text-white rounded-md flex items-center justify-center gap-1 mt-2"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </header>
  );
}
