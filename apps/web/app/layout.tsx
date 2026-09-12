import './globals.css';
import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0D1117' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'Docwyrm — The Git-Native Documentation Platform',
    template: '%s | Docwyrm',
  },
  description:
    'Open-source, Git-native, self-hostable documentation platform engineered as an advanced alternative to GitBook. Built with Next.js, Fastify, isomorphic-git, and MDX block editing.',
  keywords: [
    'Docwyrm',
    'GitBook alternative',
    'Git-native documentation',
    'open source docs',
    'self-hosted documentation',
    'MDX block editor',
    'developer documentation',
    'Docusaurus alternative',
    'technical writing',
    'markdown documentation',
  ],
  authors: [{ name: 'Docwyrm Team (@KuraPiee)', url: 'https://github.com/KuraPiee' }],
  creator: 'Docwyrm Team (@KuraPiee)',
  publisher: 'Docwyrm Open Source Project',
  metadataBase: new URL('http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Docwyrm — Git-Native Documentation Platform',
    description:
      'The modern open-source documentation platform that syncs with Git and stays in sync. Self-host with 1 Docker command.',
    url: 'https://docwyrm.dev',
    siteName: 'Docwyrm',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Docwyrm — Git-Native Documentation Platform',
    description:
      'Advanced open-source alternative to GitBook with bi-directional Git synchronization and visual diff reviews.',
    creator: '@KuraPiee',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Docwyrm',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Person',
      name: 'Docwyrm Team (@KuraPiee)',
      url: 'https://github.com/KuraPiee',
    },
    description:
      'Open-source, Git-native documentation platform and collaborative editor alternative to GitBook.',
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-canvas-light dark:bg-canvas-dark text-textPrimary-light dark:text-textPrimary-dark min-h-screen antialiased selection:bg-orange-500/20">
        {children}
      </body>
    </html>
  );
}
