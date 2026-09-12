'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Eye,
  Users,
  ThumbsUp,
  ThumbsDown,
  Clock,
  FileText,
  X,
  Loader2,
  Copy,
  Check,
  Terminal,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { getActiveLocale, TRANSLATIONS } from '@/lib/i18n';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceId: string;
  apiUrl: string;
}

interface StatsData {
  spaceId: string;
  totalViews: number;
  uniqueVisitors: number;
  helpfulScore: {
    positive: number;
    negative: number;
    percentage: number;
  };
  avgReadTimeSeconds: number;
  totalDurationSeconds: number;
  topDocuments: {
    filePath: string;
    views: number;
    helpful: number;
    unhelpful: number;
    avgDurationSec: number;
  }[];
  selfHostedPrivacyNotice: string;
}

export function AnalyticsModal({ isOpen, onClose, spaceId, apiUrl }: AnalyticsModalProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const loc = getActiveLocale();
  const t = (k: string) => TRANSLATIONS[loc]?.[k] || TRANSLATIONS.en[k] || k;

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/spaces/${spaceId}/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Failed to load stats:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen, spaceId]);

  const curlCommand = `curl http://localhost:4000/api/spaces/${spaceId}/stats`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-3xl rounded-2xl border border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleIn text-textPrimary-light dark:text-textPrimary-dark">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-subtle-light/30 dark:bg-subtle-dark/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                {t('analyticsTitle')}
              </h3>
              <p className="text-xs text-textMuted-light dark:text-textMuted-dark">
                {t('analyticsSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStats}
              disabled={isLoading}
              className="p-1.5 rounded-lg border border-border-light dark:border-border-dark hover:bg-neutral-100 dark:hover:bg-neutral-800 text-textMuted-light dark:text-textMuted-dark"
              title="Refresh Stats"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-border-light dark:border-border-dark hover:bg-neutral-100 dark:hover:bg-neutral-800 text-textMuted-light dark:text-textMuted-dark"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 text-xs flex-1">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
              <div className="text-textMuted-light dark:text-textMuted-dark">Calculating space telemetry...</div>
            </div>
          ) : stats ? (
            <>
              {/* Key Metrics Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* 1. Page Views */}
                <div className="p-3.5 rounded-xl border border-border-light dark:border-border-dark bg-subtle-light/40 dark:bg-subtle-dark/40 space-y-1">
                  <div className="flex items-center justify-between text-textMuted-light dark:text-textMuted-dark">
                    <span>{t('totalPageViews')}</span>
                    <Eye className="w-3.5 h-3.5 text-orange-500" />
                  </div>
                  <div className="text-2xl font-black tracking-tight">{stats.totalViews}</div>
                  <div className="text-[10px] text-textMuted-light dark:text-textMuted-dark font-mono">Live logged</div>
                </div>

                {/* 2. Unique Readers */}
                <div className="p-3.5 rounded-xl border border-border-light dark:border-border-dark bg-subtle-light/40 dark:bg-subtle-dark/40 space-y-1">
                  <div className="flex items-center justify-between text-textMuted-light dark:text-textMuted-dark">
                    <span>{t('uniqueReaders')}</span>
                    <Users className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="text-2xl font-black tracking-tight">{stats.uniqueVisitors}</div>
                  <div className="text-[10px] text-textMuted-light dark:text-textMuted-dark font-mono">Distinct sessions</div>
                </div>

                {/* 3. Helpful Score */}
                <div className="p-3.5 rounded-xl border border-border-light dark:border-border-dark bg-subtle-light/40 dark:bg-subtle-dark/40 space-y-1">
                  <div className="flex items-center justify-between text-textMuted-light dark:text-textMuted-dark">
                    <span>{t('helpfulScore')}</span>
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                    {stats.helpfulScore.percentage}%
                  </div>
                  <div className="text-[10px] text-textMuted-light dark:text-textMuted-dark font-mono">
                    {stats.helpfulScore.positive} 👍 / {stats.helpfulScore.negative} 👎
                  </div>
                </div>

                {/* 4. Reading Time */}
                <div className="p-3.5 rounded-xl border border-border-light dark:border-border-dark bg-subtle-light/40 dark:bg-subtle-dark/40 space-y-1">
                  <div className="flex items-center justify-between text-textMuted-light dark:text-textMuted-dark">
                    <span>{t('avgReadingTime')}</span>
                    <Clock className="w-3.5 h-3.5 text-purple-500" />
                  </div>
                  <div className="text-2xl font-black tracking-tight">
                    {Math.round(stats.avgReadTimeSeconds)}s
                  </div>
                  <div className="text-[10px] text-textMuted-light dark:text-textMuted-dark font-mono">
                    Total: {Math.round(stats.totalDurationSeconds / 60)} mins
                  </div>
                </div>
              </div>

              {/* Top Read Documents Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between font-semibold">
                  <span>{t('mostReadDocs')}</span>
                  <span className="text-[10px] font-mono text-textMuted-light dark:text-textMuted-dark">
                    Space: {spaceId}
                  </span>
                </div>

                {stats.topDocuments.length > 0 ? (
                  <div className="border border-border-light dark:border-border-dark rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-subtle-light dark:bg-subtle-dark border-b border-border-light dark:border-border-dark">
                        <tr>
                          <th className="p-2.5 font-semibold">Document Path</th>
                          <th className="p-2.5 font-semibold text-right">Page Views</th>
                          <th className="p-2.5 font-semibold text-right">Helpful Votes</th>
                          <th className="p-2.5 font-semibold text-right">Avg Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-light dark:divide-border-dark">
                        {stats.topDocuments.map((doc, idx) => (
                          <tr key={doc.filePath} className="hover:bg-subtle-light/30 dark:hover:bg-subtle-dark/30">
                            <td className="p-2.5 font-mono text-[11px] text-textPrimary-light dark:text-textPrimary-dark flex items-center gap-2">
                              <span className="w-4 text-textMuted-light dark:text-textMuted-dark">{idx + 1}.</span>
                              <FileText className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                              <span>{doc.filePath}</span>
                            </td>
                            <td className="p-2.5 text-right font-bold">{doc.views}</td>
                            <td className="p-2.5 text-right text-emerald-600 dark:text-emerald-400 font-mono">
                              +{doc.helpful}
                            </td>
                            <td className="p-2.5 text-right font-mono text-textMuted-light dark:text-textMuted-dark">
                              {doc.avgDurationSec}s
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-textMuted-light dark:text-textMuted-dark border border-dashed border-border-light dark:border-border-dark rounded-xl">
                    No page views recorded yet. Browse documents in Read mode to register telemetry!
                  </div>
                )}
              </div>

              {/* Live REST API Integration Box */}
              <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>{t('liveApiEndpoint')}</span>
                  </span>
                  <button
                    onClick={handleCopyCurl}
                    className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-mono"
                  >
                    {copiedCurl ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-900 text-neutral-200 font-mono text-[11px] overflow-x-auto">
                  {curlCommand}
                </div>
                <p className="text-[10px] text-textMuted-light dark:text-textMuted-dark leading-relaxed">
                  Integrate your self-hosted Docwyrm metrics into Grafana, Datadog, Prometheus, or your custom internal team dashboards.
                </p>
              </div>

              {/* Privacy Badge */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px]">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>
                  All metrics are stored locally in <code>.docwyrm_storage</code>. Zero third-party trackers, zero data leakage.
                </span>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-textMuted-light dark:text-textMuted-dark">
              Failed to load analytics data.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-border-light dark:border-border-dark bg-subtle-light/30 dark:bg-subtle-dark/30 flex items-center justify-between text-xs px-5">
          <span className="text-textMuted-light dark:text-textMuted-dark">
            Docwyrm Telemetry &bull; Docwyrm Team (@KuraPiee)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold hover:opacity-90 transition-opacity shadow-xs"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
}
