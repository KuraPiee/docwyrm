'use client';

import React, { useState } from 'react';
import {
  GitCommit,
  History,
  FileText,
  Server,
  ArrowRight,
  Sparkles,
  Layers,
  Box,
  Compass,
  Cpu,
  Share2,
} from 'lucide-react';
import Link from 'next/link';

export function FeaturesSection() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const features = [
    {
      icon: GitCommit,
      title: 'Git-Native by Default',
      badge: 'Zero Lock-in',
      description:
        'Every edit in Docwyrm creates an actual signed Git commit through isomorphic-git. Store your entire documentation tree directly in Git without proprietary database lock-in.',
      codeSnippet: `// Programmatic Git Commit Engine\nawait gitEngine.commitDoc(repoDir, 'index.mdx', content, {\n  name: 'Docwyrm Team',\n  email: 'team@docwyrm.dev'\n}, 'docs: update system architecture');`,
      svgVisual: (
        <svg className="w-full h-24 text-orange-500/80" viewBox="0 0 260 90" fill="none">
          <path d="M20 45H240" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" opacity="0.4" />
          <path d="M20 45 Q 80 15 140 15 H 240" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="20" cy="45" r="5" className="fill-orange-600" />
          <circle cx="90" cy="22" r="5" className="fill-amber-500" />
          <circle cx="160" cy="15" r="6" className="fill-emerald-500 animate-pulse" />
          <circle cx="230" cy="15" r="5" className="fill-orange-500" />
        </svg>
      ),
    },
    {
      icon: History,
      title: 'Visual Unified Diff Reviews',
      badge: 'Line-by-Line Hunks',
      description:
        'Inspect line-by-line differences between any two Git revisions. Clean red and green color-coded hunks provide instant clarity on what changed, who changed it, and when.',
      codeSnippet: `@@ -53,4 +53,4 @@\n- Stored in proprietary database\n+ 100% Git-native MDX versioning\n+ Real-time unified diff reviews`,
      svgVisual: (
        <svg className="w-full h-24 text-emerald-500/80" viewBox="0 0 260 90" fill="none">
          <rect x="20" y="15" width="220" height="24" rx="4" fill="rgba(239, 68, 68, 0.15)" stroke="rgba(239, 68, 68, 0.5)" strokeWidth="1" />
          <line x1="32" y1="27" x2="160" y2="27" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          <rect x="20" y="47" width="220" height="24" rx="4" fill="rgba(16, 185, 129, 0.15)" stroke="rgba(16, 185, 129, 0.5)" strokeWidth="1" />
          <line x1="32" y1="59" x2="200" y2="59" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      icon: Sparkles,
      title: 'Instant Offline Technical Knowledge',
      badge: 'Zero API Cost',
      description:
        'Pre-indexed technical runbooks accessible instantly via Ctrl+K. Get copyable Docker recipes, RunMDX codes, and Git syncing mechanics with zero external API fees.',
      codeSnippet: `// Instant Ctrl+K Pre-Indexed Knowledge\n{\n  title: '1-Command Docker Deployment',\n  category: 'Infrastructure',\n  snippet: 'docker compose -f docker-compose.yml up -d'\n}`,
      svgVisual: (
        <svg className="w-full h-24 text-blue-500/80" viewBox="0 0 260 90" fill="none">
          <rect x="40" y="20" width="180" height="50" rx="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
          <circle cx="80" cy="45" r="14" className="fill-blue-500/20" stroke="currentColor" strokeWidth="1.5" />
          <path d="M75 45L79 49L86 41" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="110" y1="38" x2="185" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="110" y1="52" x2="160" y2="52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        </svg>
      ),
    },
    {
      icon: Server,
      title: '1-Command Docker Self-Host',
      badge: 'Full Data Sovereignty',
      description:
        'Full data sovereignty. Run Docwyrm on your own AWS VPC, private cloud, or homelab with Docker Compose. Zero external telemetry, zero phone-home.',
      codeSnippet: `services:\n  docwyrm-api:\n    image: docwyrm/api:latest\n    ports: ["4000:4000"]\n  docwyrm-web:\n    image: docwyrm/web:latest\n    ports: ["3000:3000"]`,
      svgVisual: (
        <svg className="w-full h-24 text-amber-500/80" viewBox="0 0 260 90" fill="none">
          <rect x="30" y="20" width="60" height="50" rx="6" stroke="currentColor" strokeWidth="1.5" />
          <rect x="100" y="20" width="60" height="50" rx="6" stroke="currentColor" strokeWidth="1.5" />
          <rect x="170" y="20" width="60" height="50" rx="6" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="60" cy="45" r="4" className="fill-emerald-500 animate-pulse" />
          <circle cx="130" cy="45" r="4" className="fill-emerald-500 animate-pulse" />
          <circle cx="200" cy="45" r="4" className="fill-emerald-500 animate-pulse" />
        </svg>
      ),
    },
  ];

  return (
    <section id="features" className="relative py-24 border-t border-border-light dark:border-border-dark bg-neutral-50/40 dark:bg-neutral-900/30 overflow-hidden">
      {/* Background SVG Flow Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none">
          <path d="M-100 200 C 300 100, 600 500, 1300 300" stroke="#ea580c" strokeWidth="1.5" strokeDasharray="6 6" />
          <path d="M-100 600 C 400 400, 800 700, 1300 500" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>Architecture Deep Dive</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textPrimary-light dark:text-textPrimary-dark">
            Engineered for developers who love Git and hate clutter
          </h2>
          <p className="mt-3 text-sm sm:text-base text-textMuted-light dark:text-textMuted-dark">
            Why settle for closed-source docs platforms when you can have the calm reading UX of GitBook with the power, ownership, and offline speed of Git?
          </p>
        </div>

        {/* 3D Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 perspective-1000">
          {features.map((item, idx) => {
            const Icon = item.icon;
            const isItemHovered = hoveredIdx === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="group relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl border border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark hover:border-orange-400 dark:hover:border-orange-500/80 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transform-style-3d"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-neutral-100 dark:bg-neutral-800 text-textMuted-light dark:text-textMuted-dark border border-border-light dark:border-border-dark">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-textPrimary-light dark:text-textPrimary-dark mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-textMuted-light dark:text-textMuted-dark leading-relaxed mb-6">
                    {item.description}
                  </p>

                  {/* Visual SVG Element */}
                  <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-border-light dark:border-border-dark p-2 mb-4 flex items-center justify-center overflow-hidden">
                    {item.svgVisual}
                  </div>
                </div>

                {/* Code Terminal Snippet */}
                <div className="rounded-xl bg-neutral-950 text-neutral-300 p-4 font-mono text-[11px] overflow-x-auto border border-neutral-800 shadow-inner">
                  <pre className="whitespace-pre">{item.codeSnippet}</pre>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom 3D Parallax Banner */}
        <div className="mt-16 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl border border-neutral-800 relative overflow-hidden">
          {/* Subtle Background Radial Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 blur-[100px] pointer-events-none" />

          <div className="space-y-2 text-center md:text-left relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono bg-orange-950/60 border border-orange-800 text-orange-400">
              <span>Community Tier Included</span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight">
              Ready to take control of your engineering documentation?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
              Start building your Git-native knowledge base right now. 3 full books included free forever, zero vendor lock-in, and 100% open source under Docwyrm Public License v1.0.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 relative z-10">
            <Link
              href="/docs"
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg shadow-orange-600/30 hover:scale-105 active:scale-95"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
