'use client';

import React from 'react';
import Link from 'next/link';
import { GitBranch, Github, Heart } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="border-t border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark text-textMuted-light dark:text-textMuted-dark text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs">
                <GitBranch className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <span className="font-bold text-sm text-textPrimary-light dark:text-textPrimary-dark">
                Docwyrm
              </span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Open-source, Git-native, self-hostable documentation platform. An advanced alternative to GitBook.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-textPrimary-light dark:text-textPrimary-dark mb-3">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="hover:text-textPrimary-light dark:hover:text-textPrimary-dark transition-colors">
                  Git Engine
                </a>
              </li>
              <li>
                <a href="#diff-engine" className="hover:text-textPrimary-light dark:hover:text-textPrimary-dark transition-colors">
                  Unified Diff Viewer
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-textPrimary-light dark:hover:text-textPrimary-dark transition-colors">
                  Pricing Plans
                </a>
              </li>
              <li>
                <Link href="/docs" className="hover:text-textPrimary-light dark:hover:text-textPrimary-dark transition-colors">
                  Documentation App
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-textPrimary-light dark:text-textPrimary-dark mb-3">
              Architecture
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="hover:text-textPrimary-light dark:hover:text-textPrimary-dark">isomorphic-git</span>
              </li>
              <li>
                <span className="hover:text-textPrimary-light dark:hover:text-textPrimary-dark">Fastify REST API</span>
              </li>
              <li>
                <span className="hover:text-textPrimary-light dark:hover:text-textPrimary-dark">Next.js 14 App Router</span>
              </li>
              <li>
                <span className="hover:text-textPrimary-light dark:hover:text-textPrimary-dark">PostgreSQL + pgvector</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-textPrimary-light dark:text-textPrimary-dark mb-3">
              Open Source
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/KuraPiee"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-textPrimary-light dark:hover:text-textPrimary-dark flex items-center gap-1.5 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub (@KuraPiee)</span>
                </a>
              </li>
              <li>
                <span className="hover:text-textPrimary-light dark:hover:text-textPrimary-dark">MIT License</span>
              </li>
              <li>
                <span className="hover:text-textPrimary-light dark:hover:text-textPrimary-dark">Docker Compose</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border-light dark:border-border-dark flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} Docwyrm. Released under the MIT License.
          </div>
          <div className="flex items-center gap-1.5">
            <span>Crafted with</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>by</span>
            <a
              href="https://github.com/KuraPiee"
              target="_blank"
              rel="noreferrer"
              className="text-textPrimary-light dark:text-textPrimary-dark font-semibold hover:underline flex items-center gap-1"
            >
              <span>Docwyrm Team (@KuraPiee)</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
