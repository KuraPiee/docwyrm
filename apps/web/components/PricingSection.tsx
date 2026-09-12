'use client';

import React, { useState } from 'react';
import { Check, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface PricingSectionProps {
  onSelectPlan: (planName: string) => void;
}

export function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const [isAnnual, setIsAnnual] = useState(true);

  const tiers = [
    {
      name: 'Free (Community)',
      slug: 'free',
      description: 'Ideal for open-source projects, personal technical notes, and 100% self-hosted homelabs.',
      priceMonthly: 0,
      priceAnnual: 0,
      period: 'forever',
      popular: false,
      cta: 'Start for free',
      features: [
        'Unlimited public documentation spaces',
        'True Git-native bi-directional sync',
        '1-Click Docker Compose self-host',
        'WYSIWYG MDX block editor',
        'Unified visual commit diff inspector',
        'Real-time Ctrl+K full-text search',
        'GitHub Discussions & community support',
      ],
    },
    {
      name: 'Plus (Team)',
      slug: 'plus',
      description: 'For growing product & engineering teams that manage private repos and customer portals.',
      priceMonthly: 12,
      priceAnnual: 9.6,
      period: 'per user / month',
      popular: false,
      cta: 'Start 14-day free trial',
      features: [
        'Everything in Free, plus:',
        'Unlimited private spaces & repositories',
        'Custom domain with automatic TLS/SSL',
        'Branch preview deployments & PR sync',
        'Role-based permissions (Admin, Editor, Viewer)',
        'Export to PDF, Markdown & static bundle',
        'Standard email & Slack community support',
      ],
    },
    {
      name: 'Pro (Engineering)',
      slug: 'pro',
      description: 'For high-velocity engineering organizations requiring real-time multiplayer & semantic search.',
      priceMonthly: 29,
      priceAnnual: 23.2,
      period: 'per user / month',
      popular: true,
      badge: 'Most Popular',
      cta: 'Start 14-day free trial',
      features: [
        'Everything in Plus, plus:',
        'Real-time collaborative editing (Yjs CRDT)',
        'Semantic pgvector AI search & smart doc QA',
        'Automated dead-link & outdated content alert',
        'Native GitHub Actions & GitLab CI integrations',
        '99.9% uptime SLA guarantee',
        'Priority 24/7 engineering support',
      ],
    },
    {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'For organizations demanding air-gapped hosting, SAML/SSO, and compliance guarantees.',
      priceMonthly: null,
      priceAnnual: null,
      period: 'custom billing',
      popular: false,
      cta: 'Contact Sales',
      features: [
        'Everything in Pro, plus:',
        'Air-gapped on-premise & private VPC deployment',
        'SAML 2.0 / Okta / Azure AD / Google SSO',
        'SOC2 Type II compliance pack & audit logs',
        'Custom backup retention & data sovereignty',
        'Dedicated Solutions Architect & 1-hour SLA',
        'Custom plugin & theme engineering support',
      ],
    },
  ];

  return (
    <section id="pricing" className="py-24 border-t border-border-light dark:border-border-dark relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 mb-4 border border-border-light dark:border-border-dark">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
            <span>Predictable, GitBook-aligned pricing with open-source power</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-textPrimary-light dark:text-textPrimary-dark">
            Simple pricing. Unlimited open-source freedom.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-textMuted-light dark:text-textMuted-dark">
            Self-host 100% free with Docker, or let us manage high-availability infrastructure with automated backups and branch previews.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span
              className={`text-xs font-medium cursor-pointer transition-colors ${
                !isAnnual
                  ? 'text-textPrimary-light dark:text-textPrimary-dark font-semibold'
                  : 'text-textMuted-light dark:text-textMuted-dark'
              }`}
              onClick={() => setIsAnnual(false)}
            >
              Monthly billing
            </span>
            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-neutral-300 dark:bg-neutral-700 transition-colors duration-200 ease-in-out focus:outline-none"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white dark:bg-neutral-100 shadow ring-0 transition duration-200 ease-in-out ${
                  isAnnual ? 'translate-x-5 bg-orange-600 dark:bg-orange-500' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className={`text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
                isAnnual
                  ? 'text-textPrimary-light dark:text-textPrimary-dark font-semibold'
                  : 'text-textMuted-light dark:text-textMuted-dark'
              }`}
              onClick={() => setIsAnnual(true)}
            >
              <span>Annual billing</span>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => {
            const price = tier.priceMonthly === null
              ? 'Custom'
              : tier.priceMonthly === 0
              ? '$0'
              : isAnnual
              ? `$${tier.priceAnnual.toFixed(2).replace(/\.00$/, '')}`
              : `$${tier.priceMonthly}`;

            return (
              <div
                key={tier.slug}
                className={`relative flex flex-col rounded-2xl p-6 transition-all duration-200 ${
                  tier.popular
                    ? 'border-2 border-orange-500/80 bg-neutral-50/70 dark:bg-neutral-900/90 shadow-xl shadow-orange-500/5'
                    : 'border border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark hover:border-neutral-400 dark:hover:border-neutral-600'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{tier.badge}</span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-base font-bold text-textPrimary-light dark:text-textPrimary-dark">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-textMuted-light dark:text-textMuted-dark mt-1 min-h-[36px]">
                    {tier.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold tracking-tight text-textPrimary-light dark:text-textPrimary-dark">
                      {price}
                    </span>
                    {tier.period && (
                      <span className="text-xs text-textMuted-light dark:text-textMuted-dark">
                        /{tier.period}
                      </span>
                    )}
                  </div>
                  {isAnnual && tier.priceMonthly && tier.priceMonthly > 0 && (
                    <div className="text-[11px] text-textMuted-light dark:text-textMuted-dark mt-1">
                      Billed annually ($
                      {(tier.priceAnnual * 12).toFixed(0)}/yr)
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onSelectPlan(tier.name)}
                  className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm mb-6 ${
                    tier.popular
                      ? 'bg-orange-600 hover:bg-orange-700 text-white'
                      : 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200'
                  }`}
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="border-t border-border-light dark:border-border-dark pt-4 flex-1">
                  <span className="text-[11px] font-semibold text-textPrimary-light dark:text-textPrimary-dark block mb-2.5">
                    Included capabilities:
                  </span>
                  <ul className="space-y-2 text-xs text-textMuted-light dark:text-textMuted-dark">
                    {tier.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 mt-0.5 shrink-0" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table vs GitBook vs Docusaurus */}
        <div id="comparison" className="mt-20 pt-12 border-t border-border-light dark:border-border-dark">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-textPrimary-light dark:text-textPrimary-dark">
              How Docwyrm compares to GitBook & Docusaurus
            </h3>
            <p className="text-xs text-textMuted-light dark:text-textMuted-dark mt-1">
              Engineered with zero vendor lock-in, open source code, and full Git synchronization.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-border-light dark:border-border-dark">
              <thead>
                <tr className="bg-neutral-100/70 dark:bg-neutral-900/70 border-b border-border-light dark:border-border-dark text-textPrimary-light dark:text-textPrimary-dark font-semibold">
                  <th className="p-3.5">Capability</th>
                  <th className="p-3.5 text-orange-600 dark:text-orange-400 bg-orange-500/5">Docwyrm (Us)</th>
                  <th className="p-3.5">GitBook</th>
                  <th className="p-3.5">Docusaurus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark text-textMuted-light dark:text-textMuted-dark">
                <tr>
                  <td className="p-3 font-medium text-textPrimary-light dark:text-textPrimary-dark">
                    Self-Hostable Backend & Web
                  </td>
                  <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400 bg-orange-500/5">
                    ✅ Yes (1 Docker command)
                  </td>
                  <td className="p-3 text-red-500">❌ Proprietary SaaS only</td>
                  <td className="p-3 text-amber-500">⚠️ Static build only</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-textPrimary-light dark:text-textPrimary-dark">
                    True Git-Native Commits
                  </td>
                  <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400 bg-orange-500/5">
                    ✅ Yes (isomorphic-git)
                  </td>
                  <td className="p-3 text-amber-500">⚠️ Semi-synced webhook</td>
                  <td className="p-3 text-emerald-600">✅ Yes (manual Git)</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-textPrimary-light dark:text-textPrimary-dark">
                    WYSIWYG Block Editor
                  </td>
                  <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400 bg-orange-500/5">
                    ✅ Built-in AST Editor
                  </td>
                  <td className="p-3 text-emerald-600">✅ Built-in Editor</td>
                  <td className="p-3 text-red-500">❌ Code editor only</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-textPrimary-light dark:text-textPrimary-dark">
                    Visual Unified Diff Inspector
                  </td>
                  <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400 bg-orange-500/5">
                    ✅ Built-in Red/Green Hunks
                  </td>
                  <td className="p-3 text-amber-500">⚠️ Basic Change Requests</td>
                  <td className="p-3 text-red-500">❌ Git CLI only</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-textPrimary-light dark:text-textPrimary-dark">
                    Licensing & Freedom
                  </td>
                  <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400 bg-orange-500/5">
                    ✅ 100% Open-Source (MIT)
                  </td>
                  <td className="p-3 text-red-500">❌ Closed Source</td>
                  <td className="p-3 text-emerald-600">✅ MIT License</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
