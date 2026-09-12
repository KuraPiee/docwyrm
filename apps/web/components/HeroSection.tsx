'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Github,
  GitBranch,
  CheckCircle2,
  Terminal,
  Layers,
  Database,
  Shield,
  Sparkles,
  GitCommit,
  FileCode,
  Share2,
  Zap,
  Box,
  Compass,
} from 'lucide-react';

interface HeroSectionProps {
  onOpenRegister: () => void;
  onOpenLogin: () => void;
}

export function HeroSection({ onOpenRegister }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);

  // Parallax on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  // Parallax on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollOffset(window.scrollY * 0.25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 3D Card transforms
  const rotateX = isHovered ? mousePos.y * -16 : -4;
  const rotateY = isHovered ? mousePos.x * 20 : 6;

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0, y: 0 });
      }}
      className="relative overflow-hidden pt-10 pb-24 sm:pt-16 sm:pb-32 select-none"
    >
      {/* -------------------------------------------------------------
          3D PARALLAX SVG BACKGROUND MESH & GEOMETRIC FLOATING ARTIFACTS
          ------------------------------------------------------------- */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Animated Cyber Grid Matrix */}
        <div
          className="absolute inset-0 opacity-25 dark:opacity-20 animate-grid-pulse"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(234, 88, 12, 0.35) 1px, transparent 0)`,
            backgroundSize: '36px 36px',
            transform: `translateY(${scrollOffset * 0.4}px)`,
          }}
        />

        {/* Ambient 3D Volumetric Glows */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] h-[420px] bg-gradient-to-tr from-orange-500/20 via-amber-500/10 to-transparent blur-[140px] rounded-full pointer-events-none transition-transform duration-700 ease-out"
          style={{
            transform: `translate(calc(-50% + ${mousePos.x * 40}px), calc(${mousePos.y * 30}px + ${scrollOffset * 0.15}px))`,
          }}
        />
        <div
          className="absolute top-1/3 -left-32 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"
          style={{
            transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)`,
          }}
        />

        {/* SVG PARALLAX LAYER 1: Isometric Coordinate Rhombus / Cube (Left) */}
        <svg
          className="absolute top-20 left-4 sm:left-12 w-28 sm:w-40 h-28 sm:h-40 text-neutral-300 dark:text-neutral-800 animate-float-slow opacity-75"
          style={{
            transform: `translate(${mousePos.x * -45}px, ${mousePos.y * -35 - scrollOffset * 0.3}px)`,
            transition: 'transform 0.15s ease-out',
          }}
          viewBox="0 0 160 160"
          fill="none"
        >
          <path
            d="M80 15L145 52.5V127.5L80 165L15 127.5V52.5L80 15Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <path d="M80 15V90M145 52.5L80 90M15 52.5L80 90" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="80" cy="90" r="4" className="fill-orange-500" />
          <circle cx="145" cy="52.5" r="3" className="fill-amber-400" />
          <circle cx="15" cy="52.5" r="3" className="fill-neutral-400" />
          <circle cx="80" cy="15" r="3.5" className="fill-orange-400" />
        </svg>

        {/* SVG PARALLAX LAYER 2: Git Commit Directed Acyclic Graph (Right) */}
        <svg
          className="absolute top-28 right-4 sm:right-16 w-32 sm:w-48 h-32 sm:h-48 text-orange-500/40 dark:text-orange-400/30 animate-float-reverse opacity-80"
          style={{
            transform: `translate(${mousePos.x * 55}px, ${mousePos.y * 45 - scrollOffset * 0.4}px)`,
            transition: 'transform 0.15s ease-out',
          }}
          viewBox="0 0 200 200"
          fill="none"
        >
          {/* Connecting Commit Branches */}
          <path
            d="M30 160 Q 60 100 110 90 T 170 30"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M30 160 H 170"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            opacity="0.6"
          />
          <path
            d="M70 160 Q 100 130 130 90"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="2 2"
          />

          {/* Commit Nodes */}
          <circle cx="30" cy="160" r="7" className="fill-neutral-900 dark:fill-white" stroke="#ea580c" strokeWidth="2.5" />
          <circle cx="70" cy="160" r="5" className="fill-orange-500" />
          <circle cx="110" cy="90" r="7" className="fill-amber-500 animate-pulse" stroke="#ffffff" strokeWidth="2" />
          <circle cx="130" cy="90" r="5" className="fill-orange-600" />
          <circle cx="170" cy="30" r="8" className="fill-emerald-500 animate-beacon" />
          <circle cx="170" cy="160" r="6" className="fill-neutral-400 dark:fill-neutral-600" />
        </svg>

        {/* SVG PARALLAX LAYER 3: 3D Torus / Topological Ring (Center Floating) */}
        <svg
          className="absolute -bottom-10 left-1/3 w-40 h-40 opacity-40 text-neutral-400 dark:text-neutral-700 animate-float-slow"
          style={{
            transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`,
          }}
          viewBox="0 0 100 100"
          fill="none"
        >
          <ellipse cx="50" cy="50" rx="42" ry="18" stroke="currentColor" strokeWidth="1.2" transform="rotate(-25 50 50)" />
          <ellipse cx="50" cy="50" rx="30" ry="10" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" transform="rotate(-25 50 50)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top 3D Interactive Badge */}
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 text-textPrimary-light dark:text-textPrimary-dark mb-6 shadow-sm hover:shadow-md hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-300 cursor-pointer"
          style={{
            transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 10}px, 0)`,
          }}
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
          </span>
          <span className="font-semibold text-orange-600 dark:text-orange-400">Docwyrm v1.0</span>
          <span className="text-neutral-300 dark:text-neutral-700">•</span>
          <span className="text-textMuted-light dark:text-textMuted-dark">
            Git-Native • Offline Technical AI Knowledge • 3D Spatial Docs
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-textMuted-light dark:text-textMuted-dark group-hover:translate-x-0.5 transition-transform" />
        </div>

        {/* Hero Headline with Dynamic Spatial Gradient */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-textPrimary-light dark:text-textPrimary-dark max-w-4xl mx-auto leading-[1.1]">
          The docs platform that syncs with Git.{' '}
          <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent inline-block">
            Then stays in sync.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-textMuted-light dark:text-textMuted-dark max-w-2xl mx-auto leading-relaxed">
          GitBook keeps docs accurate for people and AI. Docwyrm pushes it further — true Git commits on every save, visual unified diff reviews, MDX blocks, instant offline technical search, and 100% self-hostable open source sovereignty.
        </p>

        {/* Action Buttons with 3D Hover Depth */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={onOpenRegister}
            className="group relative w-full sm:w-auto px-7 py-3.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all duration-200 shadow-lg shadow-neutral-900/15 dark:shadow-white/5 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Start for free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenRegister}
            className="w-full sm:w-auto px-5 py-3.5 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm text-textPrimary-light dark:text-textPrimary-dark border border-border-light dark:border-border-dark rounded-xl text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5"
          >
            <Github className="w-4 h-4" />
            <span>Sign up with GitHub</span>
          </button>

          <Link
            href="/docs"
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 hover:-translate-y-0.5"
          >
            <GitBranch className="w-4 h-4" />
            <span>Live Interactive Demo</span>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-5 text-xs text-textMuted-light dark:text-textMuted-dark flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free Tier (3 Full Books Included)
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Docwyrm Public License v1.0
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1-Command Docker Self-Host
          </span>
        </div>

        {/* -------------------------------------------------------------
            3D INTERACTIVE PERSPECTIVE PARALLAX APP SHOWCASE
            Tilt-reacting 3D card based on user cursor coordinates
            ------------------------------------------------------------- */}
        <div className="mt-14 relative max-w-5xl mx-auto perspective-1200">
          {/* Floating Feature Satellites (Depth Badges around the 3D showcase) */}
          <div
            className="hidden lg:flex absolute -left-12 top-16 z-20 items-center gap-2.5 px-4 py-2 rounded-xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200/90 dark:border-neutral-800 shadow-xl text-left pointer-events-none transition-transform duration-300 ease-out"
            style={{
              transform: `translate3d(${mousePos.x * -28}px, ${mousePos.y * -20}px, 40px)`,
            }}
          >
            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-orange-600 flex items-center justify-center">
              <GitCommit className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark">
                isomorphic-git
              </div>
              <div className="text-[10px] text-textMuted-light dark:text-textMuted-dark">
                Deterministic Commits
              </div>
            </div>
          </div>

          <div
            className="hidden lg:flex absolute -right-10 top-32 z-20 items-center gap-2.5 px-4 py-2 rounded-xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200/90 dark:border-neutral-800 shadow-xl text-left pointer-events-none transition-transform duration-300 ease-out"
            style={{
              transform: `translate3d(${mousePos.x * 32}px, ${mousePos.y * 25}px, 50px)`,
            }}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark">
                Ctrl+K Engine
              </div>
              <div className="text-[10px] text-textMuted-light dark:text-textMuted-dark">
                Zero-Cost Instant KB
              </div>
            </div>
          </div>

          <div
            className="hidden lg:flex absolute right-16 -bottom-6 z-20 items-center gap-2.5 px-4 py-2 rounded-xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200/90 dark:border-neutral-800 shadow-xl text-left pointer-events-none transition-transform duration-300 ease-out"
            style={{
              transform: `translate3d(${mousePos.x * 20}px, ${mousePos.y * -15}px, 30px)`,
            }}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark">
                Live REST Stats
              </div>
              <div className="text-[10px] text-textMuted-light dark:text-textMuted-dark">
                Self-Hosted Telemetry
              </div>
            </div>
          </div>

          {/* Main 3D Card Window */}
          <div
            className="transform-style-3d transition-transform duration-300 ease-out rounded-2xl border border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark shadow-2xl shadow-neutral-900/15 dark:shadow-black/50 overflow-hidden text-left ring-1 ring-black/5 dark:ring-white/10"
            style={{
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`,
            }}
          >
            {/* Top Window Bar */}
            <div className="h-11 bg-neutral-100/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-border-light dark:border-border-dark px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400 hover:opacity-80 transition-opacity cursor-pointer" />
                <div className="w-3 h-3 rounded-full bg-amber-400 hover:opacity-80 transition-opacity cursor-pointer" />
                <div className="w-3 h-3 rounded-full bg-emerald-400 hover:opacity-80 transition-opacity cursor-pointer" />
              </div>

              {/* URL / Location Bar */}
              <div className="px-3.5 py-1 rounded-lg bg-white dark:bg-neutral-800/90 border border-border-light dark:border-border-dark text-[11px] font-mono text-textMuted-light dark:text-textMuted-dark flex items-center gap-2 shadow-inner">
                <GitBranch className="w-3.5 h-3.5 text-orange-500" />
                <span className="font-medium text-textPrimary-light dark:text-textPrimary-dark">
                  docwyrm.local
                </span>
                <span className="text-neutral-400 dark:text-neutral-600">/</span>
                <span>docwyrm-developer-guide</span>
                <span className="text-neutral-400 dark:text-neutral-600">/</span>
                <span className="text-orange-600 dark:text-orange-400">getting-started</span>
              </div>

              {/* Quick Launch Action */}
              <Link
                href="/docs"
                className="px-3 py-1 rounded-md bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-sm"
              >
                <span>Launch Studio</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Simulated 3-Pane Technical Interface */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[410px]">
              {/* Left Pane: Documentation Tree & Free Tier Quota */}
              <div className="hidden md:block md:col-span-3 border-r border-border-light dark:border-border-dark bg-neutral-50/70 dark:bg-neutral-900/40 p-4 space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-textPrimary-light dark:text-textPrimary-dark pb-2 border-b border-border-light dark:border-border-dark">
                  <span className="flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-orange-500" />
                    <span>Free Tier Books</span>
                  </span>
                  <span className="text-[10px] font-mono bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 px-1.5 py-0.5 rounded font-bold">
                    3 / 3 Active
                  </span>
                </div>

                {/* Tree Items */}
                <div className="space-y-1 text-xs">
                  <div className="px-2.5 py-2 rounded-lg bg-white dark:bg-neutral-800 text-textPrimary-light dark:text-textPrimary-dark font-medium flex items-center justify-between shadow-sm border border-border-light dark:border-border-dark">
                    <span className="flex items-center gap-2">
                      <FileCode className="w-3.5 h-3.5 text-orange-500" />
                      <span>Developer Guide</span>
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="px-2.5 py-1.5 rounded-md text-textMuted-light dark:text-textMuted-dark hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 opacity-60" />
                    <span>REST API Reference</span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-md text-textMuted-light dark:text-textMuted-dark hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 opacity-60" />
                    <span>Plugin Developer Kit</span>
                  </div>
                </div>

                {/* Commit Sync Status Widget */}
                <div className="pt-4 border-t border-border-light dark:border-border-dark text-[11px] space-y-1.5 font-mono text-textMuted-light dark:text-textMuted-dark">
                  <div className="flex items-center justify-between">
                    <span>Active Branch:</span>
                    <span className="text-textPrimary-light dark:text-textPrimary-dark font-bold">main</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last Git SHA:</span>
                    <span className="text-orange-600 dark:text-orange-400">c8f49a2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sync State:</span>
                    <span className="text-emerald-500 font-semibold">SYNCHRONIZED</span>
                  </div>
                </div>
              </div>

              {/* Center Pane: WYSIWYG MDX AST Canvas */}
              <div className="col-span-12 md:col-span-6 p-6 sm:p-7 space-y-4 bg-canvas-light dark:bg-canvas-dark">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 text-textMuted-light dark:text-textMuted-dark border border-border-light dark:border-border-dark">
                    <span>Path: 01-getting-started/index.mdx</span>
                  </div>
                  <div className="text-[11px] text-textMuted-light dark:text-textMuted-dark flex items-center gap-1">
                    <span>⏱️ 2 min read</span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-textPrimary-light dark:text-textPrimary-dark">
                  Docwyrm Git-Native Architecture
                </h3>

                <p className="text-xs sm:text-sm text-textMuted-light dark:text-textMuted-dark leading-relaxed">
                  Every documentation book is backed directly by local Git trees. When you click save or run the editor, clean atomic commits are signed and synchronized.
                </p>

                {/* MDX Callout Block Preview */}
                <div className="p-3 rounded-lg bg-orange-50/60 dark:bg-orange-950/20 border-l-4 border-orange-500 text-xs space-y-1">
                  <div className="font-semibold text-orange-900 dark:text-orange-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                    <span>Instant Technical Knowledge Engine</span>
                  </div>
                  <div className="text-orange-800/90 dark:text-orange-200/90">
                    Press <kbd className="px-1 py-0.5 bg-orange-200/50 dark:bg-orange-900/50 rounded font-mono text-[10px]">Ctrl+K</kbd> to inspect instant solutions for Docker, Git sync, RunMDX, and Themes without AI token billing.
                  </div>
                </div>

                {/* Live Code Runner Block Preview */}
                <div className="rounded-xl bg-neutral-950 text-neutral-200 p-3.5 font-mono text-[11px] overflow-hidden border border-neutral-800 shadow-inner">
                  <div className="flex items-center justify-between text-neutral-500 text-[10px] pb-2 mb-2 border-b border-neutral-800">
                    <span>bash — runmdx execution preview</span>
                    <span className="text-emerald-400">● ready</span>
                  </div>
                  <div className="text-neutral-400"># Deploy self-hosted stack in 1 command</div>
                  <div className="text-orange-400 font-semibold">$ docker compose up -d</div>
                  <div className="text-neutral-500 mt-1">[+] Running 2/2: Container docwyrm-api Started (0.4s)</div>
                </div>
              </div>

              {/* Right Pane: Live Telemetry & Quick TOC */}
              <div className="hidden md:block md:col-span-3 border-l border-border-light dark:border-border-dark bg-neutral-50/40 dark:bg-neutral-900/30 p-4 space-y-4 text-left">
                <div>
                  <span className="text-xs font-semibold text-textPrimary-light dark:text-textPrimary-dark block mb-2">
                    Live Book Telemetry
                  </span>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-800/80 border border-border-light dark:border-border-dark space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-textMuted-light dark:text-textMuted-dark text-[11px]">Total Views:</span>
                      <span className="font-bold text-textPrimary-light dark:text-textPrimary-dark font-mono">1,420</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-textMuted-light dark:text-textMuted-dark text-[11px]">Helpful Score:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">98% 👍</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-textMuted-light dark:text-textMuted-dark text-[11px]">Unique Readers:</span>
                      <span className="font-bold text-textPrimary-light dark:text-textPrimary-dark font-mono">384</span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-textPrimary-light dark:text-textPrimary-dark block mb-2">
                    Table of Contents
                  </span>
                  <ul className="space-y-2 text-[11px] text-textMuted-light dark:text-textMuted-dark">
                    <li className="text-orange-600 dark:text-orange-400 font-semibold flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      <span>Architecture Overview</span>
                    </li>
                    <li className="hover:text-textPrimary-light dark:hover:text-textPrimary-dark transition-colors pl-2.5">
                      Git Storage Format
                    </li>
                    <li className="hover:text-textPrimary-light dark:hover:text-textPrimary-dark transition-colors pl-2.5">
                      Offline Knowledge Base
                    </li>
                    <li className="hover:text-textPrimary-light dark:hover:text-textPrimary-dark transition-colors pl-2.5">
                      Multiplayer Presence
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Engineering Stack Strip */}
        <div className="mt-20 pt-10 border-t border-border-light dark:border-border-dark max-w-4xl mx-auto">
          <p className="text-[11px] font-mono uppercase tracking-wider text-textMuted-light dark:text-textMuted-dark mb-6">
            Engineered with modern, high-performance infrastructure
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6 items-center justify-center text-textMuted-light dark:text-textMuted-dark text-xs font-semibold">
            <div className="flex items-center justify-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
              <Terminal className="w-4 h-4" />
              <span>isomorphic-git</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
              <Layers className="w-4 h-4" />
              <span>Next.js 14 App</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
              <Database className="w-4 h-4" />
              <span>Postgres + Storage</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
              <Terminal className="w-4 h-4" />
              <span>Fastify API</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
              <Shield className="w-4 h-4" />
              <span>TypeScript AST</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
              <Layers className="w-4 h-4" />
              <span>Docker Compose</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
