'use client';

import React from 'react';
import { EditorBlock } from '@docwyrm/types';
import { ExternalLink, History } from 'lucide-react';

interface TableOfContentsProps {
  blocks: EditorBlock[];
  docTitle?: string;
  filePath?: string;
  onSelectHeading?: (id: string) => void;
  onOpenHistory?: () => void;
}

export function TableOfContents({
  blocks,
  docTitle,
  filePath,
  onSelectHeading,
  onOpenHistory,
}: TableOfContentsProps) {
  const headings = blocks.filter(
    (b): b is EditorBlock & { type: 'heading' } => b.type === 'heading'
  );

  if (!headings.length) {
    return (
      <aside className="w-[220px] hidden xl:block p-4 select-none text-xs text-textMuted-light dark:text-textMuted-dark">
        No subheadings
      </aside>
    );
  }

  return (
    <aside className="w-[220px] hidden xl:block p-4 border-l border-border-light dark:border-border-dark select-none h-[calc(100vh-48px)] overflow-y-auto sticky top-12">
      <div className="space-y-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-textMuted-light dark:text-textMuted-dark">
          On this page
        </div>

        <nav className="space-y-1 relative">
          <div className="absolute left-0 top-0 bottom-0 border-l border-border-light dark:border-border-dark" />
          {headings.map((h) => {
            const id = h.content.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const indent = h.level === 1 ? 'pl-3' : h.level === 2 ? 'pl-5' : 'pl-7';
            return (
              <a
                key={h.id}
                href={`#${id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(id);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  if (onSelectHeading) onSelectHeading(id);
                }}
                className={`block text-xs py-1 ${indent} text-textMuted-light dark:text-textMuted-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark truncate transition-colors`}
              >
                {h.content}
              </a>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-border-light dark:border-border-dark space-y-2 text-xs">
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="flex items-center space-x-1.5 text-textMuted-light dark:text-textMuted-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              <span>Version History</span>
            </button>
          )}
          <a
            href="#edit"
            className="flex items-center space-x-1.5 text-textMuted-light dark:text-textMuted-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Git Repository</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
