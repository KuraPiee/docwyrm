'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SearchResult } from '@docwyrm/types';
import {
  Search,
  FileText,
  X,
  Loader2,
  BookOpen,
  HelpCircle,
  ChevronRight,
  Terminal,
  Copy,
  Check,
  Sparkles,
  Layers,
  GitBranch,
  Shield,
  Activity,
  Store,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface KnowledgeItem {
  id: string;
  category: string;
  title: string;
  keywords: string[];
  summary: string;
  detailedAnswer: string;
  codeSnippet?: string;
  codeLang?: string;
  relatedDocPath?: string;
}

const KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: 'kb-docker',
    category: 'Deployment',
    title: 'How do I deploy Docwyrm self-hosted in production with Docker?',
    keywords: ['docker', 'deploy', 'production', 'compose', 'self-host', 'port', 'reverse proxy'],
    summary: 'Deploy Fastify backend on port 4000 and Next.js frontend on port 3000 using standard docker compose.',
    detailedAnswer:
      'Docwyrm is fully containerized. You can run both the REST API and the Next.js web application with a single command. All git repositories, markdown content, and local analytics persist automatically to the mounted `.docwyrm_storage` volume.',
    codeSnippet: `# 1. Clone your Docwyrm instance\ngit clone https://github.com/KuraPiee/docwyrm.git\ncd docwyrm\n\n# 2. Launch production stack\ndocker compose up -d\n\n# Services:\n# - Web Studio:  http://localhost:3000\n# - Fastify API: http://localhost:4000`,
    codeLang: 'bash',
    relatedDocPath: '05-deployment/docker.mdx',
  },
  {
    id: 'kb-git-sync',
    category: 'Git Core',
    title: 'How does Docwyrm ensure true Git synchronization with zero proprietary lock-in?',
    keywords: ['git', 'sync', 'lock-in', 'commit', 'isomorphic-git', 'sha', 'branch'],
    summary: 'Every documentation book is backed directly by a real Git repository with SHA commit histories on disk.',
    detailedAnswer:
      'Unlike cloud-only documentation platforms that store pages in closed relational schemas, Docwyrm uses isomorphic-git directly over local filesystem repos. Every time an author clicks Save, an atomic Git commit is calculated, verified, and signed with SHA-1/SHA-256 hashes.',
    codeSnippet: `import { GitSyncEngine } from '@docwyrm/git-sync';\n\nconst engine = new GitSyncEngine();\nconst commitSha = await engine.commitDoc(\n  './spaces/developer-guide',\n  '01-getting-started/overview.mdx',\n  rawMdxContent,\n  { name: 'Docwyrm Team (@KuraPiee)', email: 'kurapiee@docwyrm.com' },\n  'docs: update architectural specification'\n);`,
    codeLang: 'typescript',
    relatedDocPath: '02-git-storage/git-sync.mdx',
  },
  {
    id: 'kb-3-books',
    category: 'Limits & Free Tier',
    title: 'How does the Free Tier 3-Book Limit work and how do I switch between books?',
    keywords: ['limit', 'free tier', '3 books', 'spaces', 'switch', 'book index', 'pricing'],
    summary: 'Community users can create up to 3 independent books. Backend enforces limit via 403 Forbidden.',
    detailedAnswer:
      'Each Docwyrm workspace includes 3 free documentation books (e.g. Developer Guide, API Reference, and Plugin Kit). You can switch between them in 1 click using the Book Switcher in the top-left header. If you attempt to create a 4th book, the API will return HTTP 403 protecting quota bounds.',
    codeSnippet: `// Backend limit verification in Fastify:\nif (spaces.size >= 3) {\n  return reply.status(403).send({\n    error: 'Free Tier limit reached (3 books max). Delete an existing space to proceed.'\n  });\n}`,
    codeLang: 'typescript',
    relatedDocPath: '02-spaces-and-books/lifecycle.mdx',
  },
  {
    id: 'kb-runmdx',
    category: 'Interactive Blocks',
    title: 'How do I create interactive, runnable in-browser code sandboxes in MDX?',
    keywords: ['runmdx', 'run', 'sandbox', 'code block', 'interactive', 'console', 'javascript'],
    summary: 'Annotate your JavaScript or TypeScript blocks to make them executable directly inside the documentation reader.',
    detailedAnswer:
      'Docwyrm includes the RunMDX plugin out of the box. Any fenced code block designated with runnable languages provides a Run button and sandboxed console output inspector without requiring an external server execution worker.',
    codeSnippet: `\`\`\`javascript\n// Calculates and logs average\nconst values = [10, 20, 30, 40];\nconst sum = values.reduce((a, b) => a + b, 0);\nconsole.log("Calculated Sum:", sum);\n\`\`\``,
    codeLang: 'markdown',
    relatedDocPath: '03-interactive-blocks/code-runner.mdx',
  },
  {
    id: 'kb-mermaid',
    category: 'Diagrams',
    title: 'How do I render Mermaid flowcharts and architecture diagrams?',
    keywords: ['mermaid', 'diagram', 'flowchart', 'architecture', 'graph', 'sequence'],
    summary: 'Write mermaid code blocks. Docwyrm compiles them into native SVG vectors with theme-aware styling.',
    detailedAnswer:
      'You can embed flowcharts, sequence diagrams, and git branches using standard Mermaid syntax. Docwyrm parses the AST and generates crisp vector SVGs that automatically adapt to your active Studio theme.',
    codeSnippet: `\`\`\`mermaid\ngraph TD\n  Client[Browser UI] -->|REST / Git| API[Fastify Engine]\n  API --> Storage[(Local Git Repos)]\n  API --> Analytics[(Self-Hosted Telemetry)]\n\`\`\``,
    codeLang: 'mermaid',
    relatedDocPath: '03-interactive-blocks/mermaid-diagrams.mdx',
  },
  {
    id: 'kb-analytics',
    category: 'Telemetry',
    title: 'How does self-hosted analytics work and how do I query metrics via REST API?',
    keywords: ['analytics', 'stats', 'telemetry', 'views', 'helpful', 'api', 'curl'],
    summary: 'Zero external tracking. Query live documentation views and helpful scores via GET /api/spaces/:id/stats.',
    detailedAnswer:
      'Docwyrm logs reading duration, unique visitors, page views, and helpful votes (👍 / 👎) strictly inside your self-hosted `.docwyrm_storage` directory. No Google Analytics, no third-party cookies, completely GDPR compliant.',
    codeSnippet: `# Query live space stats via curl:\ncurl http://localhost:4000/api/spaces/docwyrm-developer-guide/stats\n\n# Response contains totalViews, uniqueVisitors, and helpfulScore percentage.`,
    codeLang: 'bash',
    relatedDocPath: '01-authentication/jwt-and-oauth.mdx',
  },
  {
    id: 'kb-themes',
    category: 'Customization',
    title: 'How do I apply and develop custom themes for the Documentation Studio?',
    keywords: ['theme', 'tokyo night', 'retro crt', 'studio scope', 'colors', 'marketplace'],
    summary: 'Select themes in Studio header. Themes are isolated to .studio-scope leaving landing page clean.',
    detailedAnswer:
      'Docwyrm uses a CSS custom property token engine. Themes like Tokyo Midnight, Retro Terminal CRT, and Emerald Obsidian are strictly scoped to `.studio-scope`, ensuring your marketing landing page always maintains its pristine default white SaaS aesthetic.',
    codeSnippet: `/* Applied dynamically via data-theme attribute */\n.studio-scope[data-theme="tokyo-night"] {\n  --canvas: #1a1b26;\n  --subtle: #24283b;\n  --border: #3b4261;\n  --text-primary: #c0caf5;\n}`,
    codeLang: 'css',
    relatedDocPath: '04-themes-and-motion/theme-tokens.mdx',
  },
];

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceId: string;
  apiUrl: string;
  onSelectResult: (filePath: string) => void;
}

export function SearchModal({
  isOpen,
  onClose,
  spaceId,
  apiUrl,
  onSelectResult,
}: SearchModalProps) {
  const [activeTab, setActiveTab] = useState<'docs' | 'knowledge'>('docs');
  const [query, setQuery] = useState('');
  const [docResults, setDocResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedKbId, setExpandedKbId] = useState<string | null>(null);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { t } = useI18n();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setDocResults([]);
      setExpandedKbId(null);
    }
  }, [isOpen]);

  // Query live backend search
  useEffect(() => {
    if (!query.trim()) {
      setDocResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/spaces/${spaceId}/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setDocResults(data.results || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, spaceId, apiUrl]);

  // Filter Knowledge Base items
  const filteredKb = KNOWLEDGE_BASE.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-20 px-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl border border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scaleIn">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-border-light dark:border-border-dark flex items-center space-x-3 bg-subtle-light/40 dark:bg-subtle-dark/40">
          <Search className="w-4 h-4 text-orange-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              activeTab === 'docs'
                ? t('searchPlaceholder')
                : 'Search instant answers, architecture, Docker, Git...'
            }
            className="flex-1 bg-transparent text-sm text-textPrimary-light dark:text-textPrimary-dark focus:outline-none placeholder:text-textMuted-light dark:placeholder:text-textMuted-dark"
          />
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-orange-500" />}
          <kbd className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded border border-border-light dark:border-border-dark text-textMuted-light dark:text-textMuted-dark">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-textMuted-light dark:text-textMuted-dark hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-border-light dark:border-border-dark px-3 bg-subtle-light/20 dark:bg-subtle-dark/20">
          <button
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'docs'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-textMuted-light dark:text-textMuted-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t('searchDocsTab')}</span>
            {query.trim() && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-neutral-200 dark:bg-neutral-800">
                {docResults.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'knowledge'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-textMuted-light dark:text-textMuted-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>{t('knowledgeBaseTab')}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300">
              {filteredKb.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Live Document Search Results */}
        {activeTab === 'docs' && (
          <div className="overflow-y-auto p-3 space-y-1.5 text-xs flex-1">
            {docResults.length > 0 ? (
              docResults.map((r) => (
                <div
                  key={r.docId}
                  onClick={() => {
                    onSelectResult(r.filePath);
                    onClose();
                  }}
                  className="p-3 rounded-xl cursor-pointer hover:bg-subtle-light dark:hover:bg-subtle-dark border border-transparent hover:border-border-light dark:hover:border-border-dark transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                      <FileText className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                      <span>{r.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-textMuted-light dark:text-textMuted-dark">
                      {r.filePath}
                    </span>
                  </div>
                  <div className="text-[11px] text-textMuted-light dark:text-textMuted-dark font-mono line-clamp-2 bg-canvas-light dark:bg-canvas-dark p-1.5 rounded border border-border-light dark:border-border-dark">
                    {r.snippet}
                  </div>
                </div>
              ))
            ) : query.trim() && !isLoading ? (
              <div className="py-12 text-center text-xs text-textMuted-light dark:text-textMuted-dark space-y-2">
                <div>No documents matching &ldquo;{query}&rdquo;</div>
                <button
                  onClick={() => setActiveTab('knowledge')}
                  className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline"
                >
                  Search Instant Knowledge Base answers &rarr;
                </button>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-textMuted-light dark:text-textMuted-dark space-y-2">
                <Search className="w-8 h-8 mx-auto opacity-30 text-orange-500" />
                <p>Type keywords like &quot;Docker&quot;, &quot;Git&quot;, &quot;API&quot;, or &quot;Theme&quot; to search full-text docs.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Instant Technical Knowledge Base (Zero External AI Fees) */}
        {activeTab === 'knowledge' && (
          <div className="overflow-y-auto p-3 space-y-2.5 text-xs flex-1">
            <div className="px-2 py-1 text-[11px] text-textMuted-light dark:text-textMuted-dark flex items-center justify-between">
              <span>{t('knowledgeSubtitle')}</span>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                ● 100% Deterministic &bull; Offline Ready
              </span>
            </div>

            {filteredKb.map((item) => {
              const isExpanded = expandedKbId === item.id;
              return (
                <div
                  key={item.id}
                  className={`rounded-xl border transition-all ${
                    isExpanded
                      ? 'border-orange-500/40 bg-orange-500/5 shadow-sm'
                      : 'border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark hover:border-neutral-400 dark:hover:border-neutral-600'
                  } p-3.5`}
                >
                  <div
                    onClick={() => setExpandedKbId(isExpanded ? null : item.id)}
                    className="flex items-start justify-between cursor-pointer gap-2"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-textMuted-light dark:text-textMuted-dark">
                          {item.category}
                        </span>
                        <span className="text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-textMuted-light dark:text-textMuted-dark leading-relaxed">
                        {item.summary}
                      </p>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 text-textMuted-light dark:text-textMuted-dark transition-transform flex-shrink-0 mt-1 ${
                        isExpanded ? 'rotate-90 text-orange-500' : ''
                      }`}
                    />
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border-light dark:border-border-dark space-y-3 animate-fadeIn text-xs">
                      <p className="text-textPrimary-light dark:text-textPrimary-dark leading-relaxed">
                        {item.detailedAnswer}
                      </p>

                      {item.codeSnippet && (
                        <div className="relative rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 font-mono text-[11px] p-3 overflow-x-auto">
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-[10px] text-neutral-400">
                            <span>{item.codeLang?.toUpperCase() || 'CODE'}</span>
                            <button
                              onClick={() => handleCopyCode(item.id, item.codeSnippet!)}
                              className="flex items-center gap-1 hover:text-white transition-colors"
                            >
                              {copiedSnippetId === item.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400 font-sans">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span className="font-sans">Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
                            {item.codeSnippet}
                          </pre>
                        </div>
                      )}

                      {item.relatedDocPath && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => {
                              onSelectResult(item.relatedDocPath!);
                              onClose();
                            }}
                            className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
                          >
                            <span>Open in Studio ({item.relatedDocPath})</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-2.5 border-t border-border-light dark:border-border-dark bg-subtle-light/40 dark:bg-subtle-dark/40 flex items-center justify-between text-[11px] text-textMuted-light dark:text-textMuted-dark px-4">
          <div className="flex items-center gap-3">
            <span>Docwyrm Knowledge Engine</span>
            <span className="opacity-50">&bull;</span>
            <span>Authored by Docwyrm Team (@KuraPiee)</span>
          </div>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
