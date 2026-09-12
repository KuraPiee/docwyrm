'use client';

import React, { useState, useRef, useEffect } from 'react';
import { EditorBlock, HeadingBlock, ParagraphBlock, CodeBlock, CalloutBlock } from '@docwyrm/types';
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  GitCommit,
  Check,
  Loader2,
  Sparkles,
  Code2,
  GitGraph,
  Lightbulb,
  AlertTriangle,
  AlertCircle,
  Table as TableIcon,
  Sigma,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  Sliders,
} from 'lucide-react';
import { getActiveLocale, TRANSLATIONS } from '@/lib/i18n';

interface BlockEditorProps {
  initialBlocks: EditorBlock[];
  filePath: string;
  onSave: (blocks: EditorBlock[], message: string) => Promise<void>;
}

interface SlashCommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  category: string;
  action: () => void;
}

export function BlockEditor({ initialBlocks, filePath, onSave }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<EditorBlock[]>(initialBlocks);
  const [commitMessage, setCommitMessage] = useState(`docs: update ${filePath}`);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Slash Command State
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashTargetIndex, setSlashTargetIndex] = useState<number | null>(null);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashSelectedIdx, setSlashSelectedIdx] = useState(0);

  const loc = getActiveLocale();
  const t = (k: string) => TRANSLATIONS[loc]?.[k] || TRANSLATIONS.en[k] || k;

  const updateBlock = (id: string, partial: Partial<EditorBlock>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? ({ ...b, ...partial } as EditorBlock) : b))
    );
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    const copy = [...blocks];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;
    setBlocks(copy);
  };

  const insertBlockAt = (block: EditorBlock, targetIdx?: number) => {
    if (targetIdx !== undefined && targetIdx >= 0) {
      const copy = [...blocks];
      copy.splice(targetIdx + 1, 0, block);
      setBlocks(copy);
    } else {
      setBlocks((prev) => [...prev, block]);
    }
    setSlashMenuOpen(false);
    setSlashQuery('');
  };

  const createBlock = (
    type: 'heading' | 'paragraph' | 'code' | 'callout' | 'mermaid' | 'table',
    extra?: any
  ): EditorBlock => {
    const newId = `b_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    if (type === 'heading') {
      return { id: newId, type: 'heading', level: extra?.level || 2, content: extra?.content || 'New Heading' };
    }
    if (type === 'code') {
      return {
        id: newId,
        type: 'code',
        language: extra?.language || 'javascript',
        code: extra?.code || '// Interactive code execution\nconsole.log("Hello from Docwyrm");',
      };
    }
    if (type === 'callout') {
      return {
        id: newId,
        type: 'callout',
        variant: extra?.variant || 'tip',
        title: extra?.title || 'Tip',
        content: extra?.content || 'Useful architectural guidance.',
      };
    }
    if (type === 'mermaid') {
      return {
        id: newId,
        type: 'code',
        language: 'mermaid',
        code: 'graph TD\n  Client[Browser UI] -->|REST| API[Fastify API]\n  API --> Storage[(Local Git)]',
      };
    }
    if (type === 'table') {
      return {
        id: newId,
        type: 'table',
        headers: ['Component', 'Technology', 'Role'],
        rows: [
          ['Studio', 'Next.js 14', 'Reader & Editor'],
          ['Backend', 'Fastify', 'Git Sync & REST API'],
          ['Motion', 'Spatial Motion', 'Spring Physics'],
        ],
      } as any;
    }
    return { id: newId, type: 'paragraph', content: 'New paragraph text...' };
  };

  const slashCommands: SlashCommandItem[] = [
    {
      id: 'cmd-callout-tip',
      label: t('calloutTip'),
      icon: <Lightbulb className="w-4 h-4 text-emerald-500" />,
      category: 'Callouts',
      action: () => insertBlockAt(createBlock('callout', { variant: 'tip', title: 'Tip' }), slashTargetIndex ?? undefined),
    },
    {
      id: 'cmd-callout-warn',
      label: t('calloutWarn'),
      icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
      category: 'Callouts',
      action: () => insertBlockAt(createBlock('callout', { variant: 'warning', title: 'Warning' }), slashTargetIndex ?? undefined),
    },
    {
      id: 'cmd-callout-important',
      label: t('calloutImportant'),
      icon: <AlertCircle className="w-4 h-4 text-purple-500" />,
      category: 'Callouts',
      action: () => insertBlockAt(createBlock('callout', { variant: 'important', title: 'Important' }), slashTargetIndex ?? undefined),
    },
    {
      id: 'cmd-code-run',
      label: t('codeSandbox'),
      icon: <Code2 className="w-4 h-4 text-blue-500" />,
      category: 'Code & Sandboxes',
      action: () => insertBlockAt(createBlock('code', { language: 'javascript' }), slashTargetIndex ?? undefined),
    },
    {
      id: 'cmd-mermaid',
      label: t('mermaidDiagram'),
      icon: <GitGraph className="w-4 h-4 text-orange-500" />,
      category: 'Architecture',
      action: () => insertBlockAt(createBlock('mermaid'), slashTargetIndex ?? undefined),
    },
    {
      id: 'cmd-table',
      label: t('markdownTable'),
      icon: <TableIcon className="w-4 h-4 text-teal-500" />,
      category: 'Structure',
      action: () => insertBlockAt(createBlock('table'), slashTargetIndex ?? undefined),
    },
    {
      id: 'cmd-h1',
      label: 'Heading 1',
      icon: <Heading1 className="w-4 h-4 text-neutral-400" />,
      category: 'Headings',
      action: () => insertBlockAt(createBlock('heading', { level: 1 }), slashTargetIndex ?? undefined),
    },
    {
      id: 'cmd-h2',
      label: 'Heading 2',
      icon: <Heading2 className="w-4 h-4 text-neutral-400" />,
      category: 'Headings',
      action: () => insertBlockAt(createBlock('heading', { level: 2 }), slashTargetIndex ?? undefined),
    },
    {
      id: 'cmd-p',
      label: 'Paragraph',
      icon: <AlignLeft className="w-4 h-4 text-neutral-400" />,
      category: 'Text',
      action: () => insertBlockAt(createBlock('paragraph'), slashTargetIndex ?? undefined),
    },
  ];

  const filteredCommands = slashCommands.filter(
    (c) =>
      c.label.toLowerCase().includes(slashQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(slashQuery.toLowerCase())
  );

  // Handle paragraph text change and detect "/"
  const handleParagraphChange = (idx: number, id: string, text: string) => {
    updateBlock(id, { content: text });
    if (text.endsWith('/')) {
      setSlashTargetIndex(idx);
      setSlashMenuOpen(true);
      setSlashQuery('');
      setSlashSelectedIdx(0);
    } else if (slashMenuOpen) {
      const match = text.match(/\/([a-zA-Z0-9_-]*)$/);
      if (match) {
        setSlashQuery(match[1]);
      } else {
        setSlashMenuOpen(false);
      }
    }
  };

  const handleKeyDownOnInput = (e: React.KeyboardEvent) => {
    if (!slashMenuOpen || filteredCommands.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSlashSelectedIdx((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSlashSelectedIdx((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const targetCmd = filteredCommands[slashSelectedIdx];
      if (targetCmd) {
        // Clear the "/" character in the active block
        if (slashTargetIndex !== null && blocks[slashTargetIndex]) {
          const b = blocks[slashTargetIndex];
          if (b.type === 'paragraph') {
            const cleanText = b.content.replace(/\/([a-zA-Z0-9_-]*)$/, '').trim();
            updateBlock(b.id, { content: cleanText });
          }
        }
        targetCmd.action();
      }
    } else if (e.key === 'Escape') {
      setSlashMenuOpen(false);
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;
    setIsSaving(true);
    try {
      await onSave(blocks, commitMessage);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-[768px] mx-auto py-8 px-6 space-y-6">
      {/* Top Commit Control Bar */}
      <div className="p-3 border border-border-light dark:border-border-dark rounded-xl bg-subtle-light dark:bg-subtle-dark flex items-center justify-between space-x-3 sticky top-16 z-20 shadow-sm backdrop-blur-md">
        <div className="flex-1 flex items-center space-x-2">
          <GitCommit className="w-4 h-4 text-orange-500 flex-shrink-0" />
          <input
            type="text"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Commit message (e.g. docs: update quickstart guide)"
            className="w-full text-xs bg-canvas-light dark:bg-canvas-dark border border-border-light dark:border-border-dark rounded-lg px-2.5 py-1.5 text-textPrimary-light dark:text-textPrimary-dark focus:outline-none focus:border-orange-500 font-mono"
          />
        </div>

        <button
          onClick={handleCommit}
          disabled={isSaving || !commitMessage.trim()}
          className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 transition-all flex-shrink-0 shadow-sm"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Committing...</span>
            </>
          ) : savedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Committed!</span>
            </>
          ) : (
            <>
              <GitCommit className="w-3.5 h-3.5" />
              <span>Commit &amp; Push</span>
            </>
          )}
        </button>
      </div>

      {/* Floating / Anchored Slash Palette */}
      {slashMenuOpen && (
        <div className="sticky top-28 z-30 w-full max-w-md mx-auto rounded-2xl border border-orange-500/40 bg-canvas-light dark:bg-canvas-dark shadow-2xl overflow-hidden p-2 text-xs animate-scaleIn">
          <div className="px-3 py-1.5 border-b border-border-light dark:border-border-dark flex items-center justify-between text-[11px] text-textMuted-light dark:text-textMuted-dark">
            <span className="font-semibold text-orange-600 dark:text-orange-400">
              {t('slashCommandTitle')}
            </span>
            <span>&uarr;&darr; to navigate &bull; Enter to insert</span>
          </div>

          <div className="max-h-60 overflow-y-auto py-1 space-y-0.5">
            {filteredCommands.map((cmd, idx) => {
              const isSelected = idx === slashSelectedIdx;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    if (slashTargetIndex !== null && blocks[slashTargetIndex]?.type === 'paragraph') {
                      const cleanText = (blocks[slashTargetIndex] as ParagraphBlock).content
                        .replace(/\/([a-zA-Z0-9_-]*)$/, '')
                        .trim();
                      updateBlock(blocks[slashTargetIndex].id, { content: cleanText });
                    }
                    cmd.action();
                  }}
                  onMouseEnter={() => setSlashSelectedIdx(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold'
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-textPrimary-light dark:text-textPrimary-dark'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {cmd.icon}
                    <span>{cmd.label}</span>
                  </div>
                  <span className="text-[10px] font-mono opacity-50 uppercase">{cmd.category}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Blocks List */}
      <div className="space-y-4">
        {blocks.map((block, idx) => (
          <div
            key={block.id}
            className="group relative p-4 rounded-xl border border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark hover:border-orange-500/40 transition-colors shadow-xs"
          >
            {/* Block toolbar on hover */}
            <div className="absolute top-2.5 right-2.5 hidden group-hover:flex items-center space-x-1 bg-subtle-light dark:bg-subtle-dark border border-border-light dark:border-border-dark rounded-md p-0.5 text-textMuted-light dark:text-textMuted-dark shadow-xs">
              <button
                onClick={() => moveBlock(idx, 'up')}
                disabled={idx === 0}
                className="p-1 hover:text-textPrimary-light dark:hover:text-textPrimary-dark disabled:opacity-30 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                title="Move Up"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => moveBlock(idx, 'down')}
                disabled={idx === blocks.length - 1}
                className="p-1 hover:text-textPrimary-light dark:hover:text-textPrimary-dark disabled:opacity-30 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                title="Move Down"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
              <button
                onClick={() => removeBlock(block.id)}
                className="p-1 hover:text-rose-500 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                title="Delete Block"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {/* Block Editor Renderers */}
            {block.type === 'heading' && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-[11px] font-mono text-textMuted-light dark:text-textMuted-dark">
                  <span>Level:</span>
                  {[1, 2, 3, 4].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => updateBlock(block.id, { level: lvl as 1 | 2 | 3 | 4 })}
                      className={`px-2 py-0.5 rounded border text-[10px] ${
                        block.level === lvl
                          ? 'bg-orange-600 text-white border-transparent font-bold'
                          : 'border-border-light dark:border-border-dark text-textMuted-light dark:text-textMuted-dark'
                      }`}
                    >
                      H{lvl}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  className="w-full font-bold text-xl bg-transparent border-b border-border-light dark:border-border-dark focus:border-orange-500 focus:outline-none py-1 text-textPrimary-light dark:text-textPrimary-dark tracking-tight"
                />
              </div>
            )}

            {block.type === 'paragraph' && (
              <div className="space-y-1">
                <textarea
                  value={block.content}
                  onChange={(e) => handleParagraphChange(idx, block.id, e.target.value)}
                  onKeyDown={handleKeyDownOnInput}
                  rows={3}
                  placeholder="Write content here... Type '/' to open block palette"
                  className="w-full bg-transparent resize-y text-sm leading-relaxed border border-border-light/60 dark:border-border-dark/60 rounded-lg p-2.5 focus:border-orange-500 focus:outline-none text-textPrimary-light dark:text-textPrimary-dark"
                />
                <div className="text-[10px] text-textMuted-light dark:text-textMuted-dark font-mono flex items-center justify-between">
                  <span>Tip: Type <code className="text-orange-500 font-bold">/</code> for Callout, Mermaid, or Code</span>
                  <span>{block.content.trim().split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>
            )}

            {block.type === 'code' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono text-textMuted-light dark:text-textMuted-dark">Lang:</span>
                    <input
                      type="text"
                      value={block.language}
                      onChange={(e) => updateBlock(block.id, { language: e.target.value })}
                      className="text-xs font-mono bg-subtle-light dark:bg-subtle-dark border border-border-light dark:border-border-dark rounded-md px-2 py-0.5 w-32 text-textPrimary-light dark:text-textPrimary-dark"
                    />
                  </div>
                  {block.language === 'mermaid' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 font-semibold">
                      Mermaid Diagram
                    </span>
                  )}
                </div>
                <textarea
                  value={block.code}
                  onChange={(e) => updateBlock(block.id, { code: e.target.value })}
                  rows={6}
                  className="w-full font-mono text-xs p-3 rounded-lg bg-neutral-900 text-neutral-100 border border-neutral-800 focus:border-orange-500 focus:outline-none"
                />
              </div>
            )}

            {block.type === 'callout' && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-mono text-textMuted-light dark:text-textMuted-dark">Variant:</span>
                  {(['tip', 'warning', 'important', 'caution', 'note'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => updateBlock(block.id, { variant: v })}
                      className={`px-2 py-0.5 rounded border text-[10px] uppercase font-mono ${
                        block.variant === v
                          ? 'bg-orange-600 text-white border-transparent font-bold'
                          : 'border-border-light dark:border-border-dark text-textMuted-light dark:text-textMuted-dark'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={block.title || ''}
                  onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                  placeholder="Callout title (optional)"
                  className="w-full text-xs font-semibold bg-transparent border-b border-border-light dark:border-border-dark focus:outline-none py-1 text-textPrimary-light dark:text-textPrimary-dark"
                />
                <textarea
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  rows={2}
                  className="w-full text-xs bg-transparent border border-border-light dark:border-border-dark rounded-lg p-2 focus:outline-none text-textPrimary-light dark:text-textPrimary-dark"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Add Palette Trigger Bar */}
      <div className="p-4 border border-dashed border-border-light dark:border-border-dark rounded-xl flex flex-wrap items-center justify-center gap-2 text-xs bg-subtle-light/30 dark:bg-subtle-dark/30">
        <span className="text-textMuted-light dark:text-textMuted-dark font-medium mr-2">Insert Block:</span>
        <button
          onClick={() => insertBlockAt(createBlock('callout', { variant: 'tip' }))}
          className="px-2.5 py-1.5 rounded-lg bg-canvas-light dark:bg-canvas-dark border border-border-light dark:border-border-dark hover:border-orange-500 text-textPrimary-light dark:text-textPrimary-dark font-medium flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Lightbulb className="w-3.5 h-3.5 text-emerald-500" />
          <span>Callout Tip</span>
        </button>
        <button
          onClick={() => insertBlockAt(createBlock('code', { language: 'javascript' }))}
          className="px-2.5 py-1.5 rounded-lg bg-canvas-light dark:bg-canvas-dark border border-border-light dark:border-border-dark hover:border-orange-500 text-textPrimary-light dark:text-textPrimary-dark font-medium flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Code2 className="w-3.5 h-3.5 text-blue-500" />
          <span>Code Runner</span>
        </button>
        <button
          onClick={() => insertBlockAt(createBlock('mermaid'))}
          className="px-2.5 py-1.5 rounded-lg bg-canvas-light dark:bg-canvas-dark border border-border-light dark:border-border-dark hover:border-orange-500 text-textPrimary-light dark:text-textPrimary-dark font-medium flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <GitGraph className="w-3.5 h-3.5 text-orange-500" />
          <span>Mermaid Diagram</span>
        </button>
        <button
          onClick={() => insertBlockAt(createBlock('heading', { level: 2 }))}
          className="px-2.5 py-1.5 rounded-lg bg-canvas-light dark:bg-canvas-dark border border-border-light dark:border-border-dark hover:border-orange-500 text-textPrimary-light dark:text-textPrimary-dark font-medium flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Heading2 className="w-3.5 h-3.5 text-neutral-400" />
          <span>Heading</span>
        </button>
        <button
          onClick={() => insertBlockAt(createBlock('paragraph'))}
          className="px-2.5 py-1.5 rounded-lg bg-canvas-light dark:bg-canvas-dark border border-border-light dark:border-border-dark hover:border-orange-500 text-textPrimary-light dark:text-textPrimary-dark font-medium flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <AlignLeft className="w-3.5 h-3.5 text-neutral-400" />
          <span>Paragraph</span>
        </button>
      </div>
    </div>
  );
}
