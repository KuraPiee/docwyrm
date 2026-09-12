'use client';

import React, { useState, useEffect } from 'react';
import { FileDiff } from '@docwyrm/types';
import { GitCommit, History, ArrowRight, Check, Loader2 } from 'lucide-react';

interface CommitItem {
  sha: string;
  message: string;
  author: string;
  email: string;
  timestamp: string | Date;
}

interface VersionHistoryDiffProps {
  filePath: string;
  spaceId: string;
  apiUrl?: string;
}

export function VersionHistoryDiff({
  filePath,
  spaceId,
  apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
}: VersionHistoryDiffProps) {
  const [history, setHistory] = useState<CommitItem[]>([]);
  const [selectedFrom, setSelectedFrom] = useState<string>('');
  const [selectedTo, setSelectedTo] = useState<string>('');
  const [diff, setDiff] = useState<FileDiff | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingDiff, setLoadingDiff] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      setLoadingHistory(true);
      try {
        const res = await fetch(`${apiUrl}/api/spaces/${spaceId}/history/${filePath}`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data.history || []);
          if (data.history && data.history.length >= 2) {
            setSelectedTo(data.history[0].sha);
            setSelectedFrom(data.history[1].sha);
          } else if (data.history && data.history.length === 1) {
            setSelectedTo(data.history[0].sha);
          }
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoadingHistory(false);
      }
    }
    fetchHistory();
  }, [filePath, spaceId, apiUrl]);

  useEffect(() => {
    async function fetchDiff() {
      if (!selectedFrom || !selectedTo) return;
      setLoadingDiff(true);
      try {
        const res = await fetch(
          `${apiUrl}/api/spaces/${spaceId}/diff/${filePath}?from=${selectedFrom}&to=${selectedTo}`
        );
        if (res.ok) {
          const data = await res.json();
          setDiff(data.diff);
        }
      } catch (err) {
        console.error('Failed to load diff:', err);
      } finally {
        setLoadingDiff(false);
      }
    }
    fetchDiff();
  }, [selectedFrom, selectedTo, filePath, spaceId, apiUrl]);

  if (loadingHistory) {
    return (
      <div className="max-w-[840px] mx-auto py-16 flex items-center justify-center space-x-2 text-xs text-textMuted-light dark:text-textMuted-dark">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Loading commit history...</span>
      </div>
    );
  }

  return (
    <div className="max-w-[840px] mx-auto py-8 px-6 space-y-6">
      <div className="space-y-1 border-b border-border-light dark:border-border-dark pb-4">
        <div className="flex items-center space-x-2 text-xs text-textMuted-light dark:text-textMuted-dark">
          <History className="w-4 h-4" />
          <span className="font-mono">{filePath}</span>
        </div>
        <h2 className="text-xl font-semibold text-textPrimary-light dark:text-textPrimary-dark">
          Version History & Git Diffs
        </h2>
      </div>

      {/* Comparison Selector */}
      {history.length >= 2 ? (
        <div className="p-3 border border-border-light dark:border-border-dark rounded-lg bg-subtle-light dark:bg-subtle-dark flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <div>
              <span className="text-textMuted-light dark:text-textMuted-dark block text-[10px] uppercase font-mono mb-1">
                From (Base)
              </span>
              <select
                value={selectedFrom}
                onChange={(e) => setSelectedFrom(e.target.value)}
                className="bg-canvas-light dark:bg-canvas-dark border border-border-light dark:border-border-dark rounded px-2 py-1 font-mono text-xs text-textPrimary-light dark:text-textPrimary-dark"
              >
                {history.map((c) => (
                  <option key={c.sha} value={c.sha}>
                    {c.sha.slice(0, 7)} — {c.message}
                  </option>
                ))}
              </select>
            </div>

            <ArrowRight className="w-4 h-4 text-textMuted-light dark:text-textMuted-dark mt-4 flex-shrink-0" />

            <div>
              <span className="text-textMuted-light dark:text-textMuted-dark block text-[10px] uppercase font-mono mb-1">
                To (Compare)
              </span>
              <select
                value={selectedTo}
                onChange={(e) => setSelectedTo(e.target.value)}
                className="bg-canvas-light dark:bg-canvas-dark border border-border-light dark:border-border-dark rounded px-2 py-1 font-mono text-xs text-textPrimary-light dark:text-textPrimary-dark"
              >
                {history.map((c) => (
                  <option key={c.sha} value={c.sha}>
                    {c.sha.slice(0, 7)} — {c.message}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-[11px] font-mono text-textMuted-light dark:text-textMuted-dark">
            {history.length} commits total
          </div>
        </div>
      ) : (
        <div className="p-4 border border-border-light dark:border-border-dark rounded-lg bg-subtle-light/50 dark:bg-subtle-dark/50 text-xs text-textMuted-light dark:text-textMuted-dark">
          Only 1 commit exists for this document yet. Edit and commit changes to generate diff histories.
        </div>
      )}

      {/* Diff View */}
      {loadingDiff ? (
        <div className="py-12 flex items-center justify-center space-x-2 text-xs text-textMuted-light dark:text-textMuted-dark">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Generating visual diff...</span>
        </div>
      ) : diff && diff.hunks.length > 0 ? (
        <div className="border border-border-light dark:border-border-dark rounded-lg overflow-hidden font-mono text-xs">
          <div className="bg-subtle-light dark:bg-[#111620] px-3 py-2 border-b border-border-light dark:border-border-dark flex items-center justify-between text-textMuted-light dark:text-textMuted-dark">
            <span>{diff.newPath}</span>
            <span>{diff.hunks.length} hunk(s)</span>
          </div>

          <div className="divide-y divide-border-light/40 dark:divide-border-dark/40 bg-canvas-light dark:bg-[#0D1117]">
            {diff.hunks.map((hunk, hi) => (
              <div key={hi}>
                <div className="bg-subtle-light/60 dark:bg-subtle-dark/60 text-accentFocus-light dark:text-accentFocus-dark px-3 py-1 text-[11px]">
                  @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
                </div>
                {hunk.lines.map((line, li) => {
                  const isAdd = line.type === 'add';
                  const isDel = line.type === 'delete';
                  return (
                    <div
                      key={li}
                      className={`flex items-start px-2 py-0.5 leading-5 select-text ${
                        isAdd
                          ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                          : isDel
                          ? 'bg-rose-500/10 text-rose-800 dark:text-rose-300'
                          : 'text-textMuted-light dark:text-textMuted-dark'
                      }`}
                    >
                      <span className="w-10 text-right pr-3 select-none opacity-40 text-[10px]">
                        {line.oldLineNumber || ''}
                      </span>
                      <span className="w-10 text-right pr-3 select-none opacity-40 text-[10px]">
                        {line.newLineNumber || ''}
                      </span>
                      <span className="w-4 select-none font-bold">
                        {isAdd ? '+' : isDel ? '-' : ' '}
                      </span>
                      <pre className="flex-1 font-mono whitespace-pre-wrap break-all">
                        {line.content}
                      </pre>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-xs text-textMuted-light dark:text-textMuted-dark">
          No differences found between selected versions.
        </div>
      )}

      {/* Full Commit List */}
      <div className="space-y-2 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-textMuted-light dark:text-textMuted-dark">
          Commit Activity
        </h3>
        <div className="border border-border-light dark:border-border-dark rounded-lg divide-y divide-border-light dark:divide-border-dark bg-canvas-light dark:bg-canvas-dark">
          {history.map((c) => (
            <div key={c.sha} className="p-3 flex items-start justify-between text-xs hover:bg-subtle-light/40 dark:hover:bg-subtle-dark/40 transition-colors">
              <div className="space-y-1">
                <div className="font-medium text-textPrimary-light dark:text-textPrimary-dark">
                  {c.message}
                </div>
                <div className="text-textMuted-light dark:text-textMuted-dark text-[11px]">
                  <span>{c.author}</span> · <span>{new Date(c.timestamp).toLocaleString()}</span>
                </div>
              </div>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-subtle-light dark:bg-subtle-dark border border-border-light dark:border-border-dark text-textMuted-light dark:text-textMuted-dark">
                {c.sha.slice(0, 7)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
