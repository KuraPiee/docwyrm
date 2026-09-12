'use client';

import React, { useState, useEffect } from 'react';
import { LandingNav } from '@/components/LandingNav';
import { HeroSection } from '@/components/HeroSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { PricingSection } from '@/components/PricingSection';
import { LandingFooter } from '@/components/LandingFooter';
import { AuthModal } from '@/components/AuthModal';
import { getSession, clearSession, UserSession } from '@/lib/session';
import { initTheme } from '@/lib/theme';

export default function LandingPage() {
  const [isDark, setIsDark] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('register');
  const [session, setSession] = useState<UserSession | null>(null);

  // Initialize active theme & read session on mount
  useEffect(() => {
    initTheme();
    const existing = getSession();
    if (existing) {
      setSession(existing);
    }
  }, []);

  // Sync dark theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleOpenLogin = () => {
    setAuthTab('login');
    setIsAuthOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthTab('register');
    setIsAuthOpen(true);
  };

  const handleSelectPlan = (planName: string) => {
    if (session) {
      // If already logged in, direct to Studio
      window.location.href = '/docs';
      return;
    }
    setAuthTab('register');
    setIsAuthOpen(true);
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas-light dark:bg-canvas-dark text-textPrimary-light dark:text-textPrimary-dark selection:bg-orange-500/20">
      {/* Navigation with 1-week session profile */}
      <LandingNav
        onOpenLogin={handleOpenLogin}
        onOpenRegister={handleOpenRegister}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        session={session}
        onLogout={handleLogout}
      />

      {/* Main Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection
          onOpenRegister={session ? () => (window.location.href = '/docs') : handleOpenRegister}
          onOpenLogin={handleOpenLogin}
        />

        {/* Feature Deep Dive */}
        <FeaturesSection />

        {/* GitBook-Aligned Pricing & Comparison */}
        <PricingSection onSelectPlan={handleSelectPlan} />
      </main>

      {/* Footer */}
      <LandingFooter />

      {/* Sign In / Sign Up Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialTab={authTab}
        onAuthSuccess={(newSession) => {
          setSession(newSession);
        }}
      />
    </div>
  );
}
