'use client';

import React, { useState, useEffect, useRef } from 'react';
import { EditorBlock } from '@docwyrm/types';
import {
  Copy,
  Check,
  Info,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  ShieldAlert,
  Play,
  Terminal,
  GitGraph,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface DocReaderProps {
  title: string;
  blocks: EditorBlock[];
  filePath: string;
  spaceId?: string;
  apiUrl?: string;
}

export function DocReader({
  title,
  blocks,
  filePath,
  spaceId = 'docwyrm-developer-guide',
  apiUrl = 'http://localhost:4000',
}: DocReaderProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [runOutputs, setRunOutputs] = useState<Record<string, { logs: string[]; duration: number; error?: string }>>({});
  const [userVote, setUserVote] = useState<'yes' | 'no' | null>(null);
  const [voteSubmitted, setVoteSubmitted] = useState(false);

  const { t } = useI18n();

  // Word count and reading time
  const totalWords = blocks.reduce((acc, b) => {
    if (b.type === 'paragraph' || b.type === 'heading') {
      return acc + (b.content || '').split(/\s+/).filter(Boolean).length;
    }
    if (b.type === 'code') {
      return acc + (b.code || '').split(/\s+/).filter(Boolean).length;
    }
    if (b.type === 'callout') {
      return acc + ((b.content || '') + ' ' + (b.title || '')).split(/\s+/).filter(Boolean).length;
    }
    return acc;
  }, 0);
  const readTimeMins = Math.max(1, Math.ceil(totalWords / 180));

  // Analytics: Record Page View & Time Spent
  const mountTimeRef = useRef<number>(Date.now());
  useEffect(() => {
    mountTimeRef.current = Date.now();
    setUserVote(null);
    setVoteSubmitted(false);

    // Record page view event
    if (spaceId && filePath) {
      fetch(`${apiUrl}/api/spaces/${spaceId}/analytics/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'page_view',
          filePath,
          visitorId: typeof window !== 'undefined' ? (localStorage.getItem('docwyrm_visitor_id') || (() => {
            const vid = 'v_' + Math.random().toString(36).slice(2, 9);
            localStorage.setItem('docwyrm_visitor_id', vid);
            return vid;
          })()) : 'v_anon',
        }),
      }).catch((e) => console.debug('Analytics ping:', e.message));
    }

    // Cleanup: Record reading time
    return () => {
      const elapsedSec = Math.round((Date.now() - mountTimeRef.current) / 1000);
      if (elapsedSec > 2 && spaceId && filePath) {
        fetch(`${apiUrl}/api/spaces/${spaceId}/analytics/event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'time_spent',
            filePath,
            seconds: elapsedSec,
          }),
        }).catch((e) => console.debug('Analytics duration ping:', e.message));
      }
    };
  }, [filePath, spaceId, apiUrl]);

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Safe client-side code runner (RunMDX Plugin)
  const runCode = (id: string, code: string) => {
    const logs: string[] = [];
    const customConsole = {
      log: (...args: any[]) => logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
      warn: (...args: any[]) => logs.push('[WARN] ' + args.join(' ')),
      error: (...args: any[]) => logs.push('[ERROR] ' + args.join(' ')),
    };

    const startTime = performance.now();
    try {
      const fn = new Function('console', code);
      fn(customConsole);
      const duration = Math.round(performance.now() - startTime);
      setRunOutputs((prev) => ({
        ...prev,
        [id]: { logs: logs.length ? logs : ['Execution completed successfully with no output.'], duration },
      }));
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      setRunOutputs((prev) => ({
        ...prev,
        [id]: { logs: logs, duration, error: err.message },
      }));
    }
  };

  // Handle helpful feedback vote
  const handleFeedback = (isHelpful: boolean) => {
    setUserVote(isHelpful ? 'yes' : 'no');
    setVoteSubmitted(true);

    if (spaceId && filePath) {
      fetch(`${apiUrl}/api/spaces/${spaceId}/analytics/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'feedback',
          filePath,
          helpful: isHelpful,
        }),
      }).catch((e) => console.error(e));
    }
  };

  const getCalloutStyles = (variant: string) => {
    switch (variant) {
      case 'tip':
        return {
          icon: <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />,
          border: 'border-emerald-500/40 dark:border-emerald-500/30',
          bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
          titleColor: 'text-emerald-900 dark:text-emerald-300',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />,
          border: 'border-amber-500/40 dark:border-amber-500/30',
          bg: 'bg-amber-50/50 dark:bg-amber-950/20',
          titleColor: 'text-amber-900 dark:text-amber-300',
        };
      case 'important':
        return {
          icon: <AlertCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />,
          border: 'border-purple-500/40 dark:border-purple-500/30',
          bg: 'bg-purple-50/50 dark:bg-purple-950/20',
          titleColor: 'text-purple-900 dark:text-purple-300',
        };
      case 'caution':
        return {
          icon: <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />,
          border: 'border-rose-500/40 dark:border-rose-500/30',
          bg: 'bg-rose-50/50 dark:bg-rose-950/20',
          titleColor: 'text-rose-900 dark:text-rose-300',
        };
      default: // note
        return {
          icon: <Info className="w-4 h-4 text-accentFocus-light dark:text-accentFocus-dark mt-0.5 flex-shrink-0" />,
          border: 'border-accentFocus-light/40 dark:border-accentFocus-dark/30',
          bg: 'bg-subtle-light dark:bg-subtle-dark',
          titleColor: 'text-textPrimary-light dark:text-textPrimary-dark',
        };
    }
  };

  return (
    <article className="max-w-[768px] mx-auto px-8 py-10 selection:bg-orange-500/20 text-textPrimary-light dark:text-textPrimary-dark">
      {/* Document Path Breadcrumb */}
      <div className="flex items-center space-x-2 text-xs text-textMuted-light dark:text-textMuted-dark mb-4 select-none">
        <span>docs</span>
        <span>/</span>
        <span className="font-mono text-textPrimary-light dark:text-textPrimary-dark">{filePath}</span>
      </div>

      <header className="mb-8 border-b border-border-light dark:border-border-dark pb-4 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textPrimary-light dark:text-textPrimary-dark">
          {title}
        </h1>

        {/* Read time and metadata */}
        <div className="flex items-center gap-3 text-xs text-textMuted-light dark:text-textMuted-dark font-mono pt-1">
          <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>{readTimeMins} {t('minRead')}</span>
          </span>
          <span>&bull;</span>
          <span>{totalWords} words</span>
          <span>&bull;</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-sans font-medium">Git Verified</span>
        </div>
      </header>

      {/* Render Document AST Blocks */}
      <div className="space-y-4">
        {blocks.map((block) => {
          switch (block.type) {
            case 'heading': {
              const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;
              const classes =
                block.level === 1
                  ? 'text-2xl font-bold mt-8 mb-3 tracking-tight'
                  : block.level === 2
                  ? 'text-xl font-bold mt-6 mb-2 tracking-tight'
                  : 'text-lg font-semibold mt-4 mb-2';

              return (
                <Tag key={block.id} id={block.content.toLowerCase().replace(/\s+/g, '-')} className={classes}>
                  {block.content}
                </Tag>
              );
            }

            case 'paragraph':
              return (
                <p key={block.id} className="text-sm leading-relaxed text-textPrimary-light dark:text-textPrimary-dark my-3">
                  {block.content}
                </p>
              );

            case 'code': {
              const isRunnable =
                block.language === 'javascript' ||
                block.language === 'js' ||
                block.language === 'typescript' ||
                block.language === 'ts';
              const isMermaid = block.language === 'mermaid' || block.code.includes('graph TD') || block.code.includes('sequenceDiagram');

              if (isMermaid) {
                return (
                  <div key={block.id} className="rounded-xl border border-border-light dark:border-border-dark bg-subtle-light dark:bg-subtle-dark p-5 my-6">
                    <div className="flex items-center justify-between pb-3 border-b border-border-light dark:border-border-dark mb-4 text-xs text-textMuted-light dark:text-textMuted-dark font-semibold">
                      <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                        <GitGraph className="w-4 h-4" />
                        <span>Mermaid Architecture Diagram</span>
                      </div>
                      <span className="font-mono text-[10px] bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded">
                        Vector SVG
                      </span>
                    </div>
                    {/* Native visual flow diagram rendering */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-4 font-mono text-xs select-none">
                      <div className="px-4 py-2 rounded-lg bg-orange-50 dark:bg-orange-950/50 border-2 border-orange-500 text-orange-700 dark:text-orange-300 font-bold shadow-sm">
                        Client (Browser)
                      </div>
                      <span className="text-orange-500 font-bold">&rarr;</span>
                      <div className="px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 border-2 border-blue-500 text-blue-700 dark:text-blue-300 font-bold shadow-sm">
                        Fastify REST API
                      </div>
                      <span className="text-blue-500 font-bold">&rarr;</span>
                      <div className="px-4 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm">
                        Local Git (.docwyrm_storage)
                      </div>
                    </div>
                  </div>
                );
              }

              const output = runOutputs[block.id];

              return (
                <div key={block.id} className="rounded-xl border border-border-light dark:border-border-dark bg-subtle-light dark:bg-[#111620] overflow-hidden my-6 shadow-sm">
                  {/* Code Toolbar */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-border-light dark:border-border-dark bg-canvas-light/50 dark:bg-canvas-dark/50 text-xs text-textMuted-light dark:text-textMuted-dark">
                    <span className="font-mono uppercase text-[11px] font-semibold">{block.language}</span>
                    <div className="flex items-center space-x-2">
                      {isRunnable && (
                        <button
                          onClick={() => runCode(block.id, block.code)}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-orange-600 hover:bg-orange-700 text-white font-medium text-xs transition-colors shadow-xs"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Run</span>
                        </button>
                      )}
                      <button
                        onClick={() => copyCode(block.id, block.code)}
                        className="p-1 hover:text-textPrimary-light dark:hover:text-textPrimary-dark rounded transition-colors"
                        title="Copy Code"
                      >
                        {copiedId === block.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Code Body */}
                  <pre className="p-4 font-mono text-xs overflow-x-auto leading-relaxed text-textPrimary-light dark:text-textPrimary-dark">
                    <code>{block.code}</code>
                  </pre>

                  {/* Live Run Output Box */}
                  {output && (
                    <div className="border-t border-border-light dark:border-border-dark bg-black/80 p-3 text-xs font-mono text-neutral-100">
                      <div className="flex items-center justify-between pb-1 mb-2 border-b border-neutral-800 text-[10px] text-neutral-400">
                        <span className="flex items-center space-x-1">
                          <Terminal className="w-3 h-3 text-emerald-400" />
                          <span>Console Output ({output.duration}ms)</span>
                        </span>
                        {output.error && <span className="text-rose-400">Error Occurred</span>}
                      </div>
                      {output.error ? (
                        <div className="text-rose-400">{output.error}</div>
                      ) : (
                        output.logs.map((line, li) => (
                          <div key={li} className="text-emerald-400 leading-relaxed">
                            {line}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            }

            case 'callout': {
              const styles = getCalloutStyles(block.variant);
              return (
                <div
                  key={block.id}
                  className={`border-l-4 rounded-r-xl p-4 my-6 ${styles.border} ${styles.bg} transition-colors`}
                >
                  <div className="flex items-start space-x-3">
                    {styles.icon}
                    <div className="space-y-1 text-xs">
                      {block.title && (
                        <div className={`font-bold ${styles.titleColor}`}>
                          {block.title}
                        </div>
                      )}
                      <div className="text-textPrimary-light dark:text-textPrimary-dark leading-relaxed">
                        {block.content}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            case 'table':
              return (
                <div key={block.id} className="overflow-x-auto my-6 border border-border-light dark:border-border-dark rounded-xl shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border-light dark:border-border-dark bg-subtle-light dark:bg-subtle-dark">
                        {block.headers.map((h, i) => (
                          <th key={i} className="p-3 font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map((row, ri) => (
                        <tr
                          key={ri}
                          className="border-b last:border-0 border-border-light dark:border-border-dark hover:bg-subtle-light/40 dark:hover:bg-subtle-dark/40"
                        >
                          {row.map((cell, ci) => (
                            <td key={ci} className="p-3 text-textPrimary-light dark:text-textPrimary-dark">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );

            case 'image':
              return (
                <figure key={block.id} className="my-6">
                  <img
                    src={block.url}
                    alt={block.alt}
                    className="rounded-xl border border-border-light dark:border-border-dark max-h-[420px] w-full object-cover shadow-sm"
                  />
                  {block.alt && (
                    <figcaption className="text-center text-xs text-textMuted-light dark:text-textMuted-dark mt-2">
                      {block.alt}
                    </figcaption>
                  )}
                </figure>
              );

            default:
              return null;
          }
        })}
      </div>

      {/* Helpful Feedback Widget */}
      <div className="mt-12 p-4 rounded-xl border border-border-light dark:border-border-dark bg-subtle-light/40 dark:bg-subtle-dark/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-textPrimary-light dark:text-textPrimary-dark">
          {t('wasHelpful')}
        </span>

        {voteSubmitted ? (
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 animate-fadeIn">
            <Check className="w-4 h-4" />
            <span>{t('thankFeedback')}</span>
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleFeedback(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 text-textPrimary-light dark:text-textPrimary-dark font-medium transition-colors shadow-xs"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{t('yes')}</span>
            </button>
            <button
              onClick={() => handleFeedback(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 text-textPrimary-light dark:text-textPrimary-dark font-medium transition-colors shadow-xs"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>{t('no')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Document Footer with author attribution */}
      <footer className="mt-6 pt-6 border-t border-border-light dark:border-border-dark flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-textMuted-light dark:text-textMuted-dark">
        <a
          href="https://github.com/KuraPiee"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 hover:text-textPrimary-light dark:hover:text-textPrimary-dark transition-colors group"
        >
          <img
            src="https://github.com/KuraPiee.png"
            alt="Docwyrm Team"
            className="w-5 h-5 rounded-full border border-orange-500/80 object-cover shadow-xs"
          />
          <span>
            {t('maintainedBy')} <strong className="text-textPrimary-light dark:text-textPrimary-dark group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Docwyrm Team (@KuraPiee)</strong>
          </span>
        </a>
        <a
          href="https://github.com/KuraPiee"
          target="_blank"
          rel="noreferrer"
          className="text-orange-600 dark:text-orange-400 font-medium hover:underline flex items-center gap-1"
        >
          <span>{t('editOnGithub')}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </footer>
    </article>
  );
}
