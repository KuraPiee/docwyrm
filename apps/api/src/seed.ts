import path from 'node:path';
import fs from 'node:fs';
import { DocSpace } from '@docwyrm/types';
import { GitSyncEngine } from '@docwyrm/git-sync';

export function seedDeveloperBooks(storageRoot: string, spaces: Map<string, DocSpace>, gitEngine: GitSyncEngine) {
  const author = { name: 'Docwyrm Team (@KuraPiee)', email: 'kurapiee@docwyrm.com' };

  // ============================================================================
  // BOOK 1: Docwyrm Developer Guide & SDK
  // ============================================================================
  const book1Id = 'docwyrm-developer-guide';
  const book1Dir = path.join(storageRoot, book1Id);

  if (!spaces.has(book1Id)) {
    spaces.set(book1Id, {
      id: book1Id,
      projectId: 'proj-1',
      slug: 'developer-guide',
      title: 'Docwyrm Developer Guide & SDK',
      description: 'Official core developer guide and platform documentation for Docwyrm.',
      isPrivate: false,
      isSystemProtected: true,
      gitProvider: 'GENERIC',
      gitRepoUrl: 'local',
      gitBranch: 'main',
      gitBasePath: '',
      syncStatus: 'IDLE',
      lastSyncedAt: new Date(),
    });

    const book1Docs = [
      {
        path: '01-getting-started/overview.mdx',
        content: `---
title: Docwyrm Architecture & Philosophy
category: Getting Started
---

# Docwyrm Architecture & Philosophy

Docwyrm is an open-source, Git-native documentation platform engineered as an advanced, self-hostable alternative to GitBook.

> [!NOTE] Git-Native Core
> Every documentation space is backed by a true Git repository. Zero proprietary database lock-in.

## Architectural Pillars

1. **True Git Persistence**: All documents exist as real MDX files on disk with SHA commit histories.
2. **Deterministic MDX AST Compiler**: Structured markdown parsing and serialization preserving frontmatter, code blocks, tables, and alerts.
3. **Hardware-Accelerated Physics Motion**: Powered by \`@docwyrm/spatial-motion\` with WAAPI spring physics.
4. **Community Theme & Plugin Engine**: Real-time CSS custom property tokens applied dynamically without full page reloads.

\`\`\`typescript
import { GitSyncEngine } from '@docwyrm/git-sync';

const gitEngine = new GitSyncEngine();
const commitSha = await gitEngine.commitDoc(
  './spaces/developer-guide',
  '01-getting-started/overview.mdx',
  content,
  { name: 'Docwyrm Team (@KuraPiee)', email: 'kurapiee@docwyrm.com' },
  'docs: release architecture guide'
);
\`\`\`

| Component | Technology | Responsibility |
| --- | --- | --- |
| Web Application | Next.js 14 App Router | 3-Pane Studio reader, block editor, theme switcher |
| Backend API | Fastify & TypeScript | Git operations, tree indexing, OAuth authentication |
| Git Engine | isomorphic-git | Bidirectional syncing, commits, and structured diffs |
| Motion Engine | @docwyrm/spatial-motion | Spring accordion physics & frosted glass illumination |
`,
      },
      {
        path: '01-getting-started/quickstart.mdx',
        content: `---
title: 5-Minute Developer Quickstart
category: Getting Started
---

# 5-Minute Developer Quickstart

Get your local Docwyrm development instance up and running in under 5 minutes.

## Prerequisites

- **Node.js**: v18.0.0 or later (Node 20+ recommended)
- **pnpm**: v9.0.0 or later

## Installation Steps

\`\`\`bash
# 1. Clone the repository
git clone https://github.com/KuraPiee/docwyrm.git
cd docwyrm

# 2. Install workspace dependencies
pnpm install

# 3. Launch both Fastify API and Next.js Web Studio concurrently
pnpm dev
\`\`\`

> [!TIP] Port Allocation
> - **Web Studio**: \`http://localhost:3000\`
> - **Fastify API**: \`http://localhost:4000\`

## Running Automated Tests

Docwyrm maintains 100% test coverage across git operations, MDX serialization, and spring motion physics:

\`\`\`bash
pnpm -r test
\`\`\`
`,
      },
      {
        path: '02-git-storage/git-sync-engine.mdx',
        content: `---
title: Git-Native Storage & Version Control
category: Git Storage Engine
---

# Git-Native Storage & Version Control

Unlike legacy documentation platforms that store markdown blobs in relational SQL tables, Docwyrm directly uses Git as its single source of truth.

## How Git Sync Works

Every space in Docwyrm represents a full Git repository:

\`\`\`mermaid
flowchart TD
  Client[Web Studio Editor] -->|PUT /api/spaces/:id/docs/*| API[Fastify REST Service]
  API -->|isomorphic-git| Storage[(Local Git Repo)]
  Storage -->|SHA Commit| Tree[Git Tree & History]
  Tree -->|Diff Inspector| Diff[Visual Line-by-Line Diff]
\`\`\`

## Key Benefits

- **Auditability**: Every change tracks the author's real name, email, and timestamp.
- **Bi-Directional**: You can edit in the Docwyrm browser studio OR edit files in VS Code and push via standard \`git commit\`.
- **Zero Lock-In**: Export or clone your documentation repository anytime.
`,
      },
      {
        path: '02-git-storage/branching-and-diffs.mdx',
        content: `---
title: Branching Workflows & Visual Diffs
category: Git Storage Engine
---

# Branching Workflows & Visual Diffs

Docwyrm supports multi-branch documentation development. Writers can create drafts in isolated Git branches without affecting the public documentation.

## Branch Switching

Use the branch selector in the studio header or call the REST API:

\`\`\`bash
curl -X POST http://localhost:4000/api/spaces/docwyrm-developer-guide/checkout \\
  -H "Content-Type: application/json" \\
  -d '{"branchName": "v2-drafts"}'
\`\`\`

> [!NOTE] Visual Diff Inspection
> When reviewing revisions in **History Mode**, Docwyrm computes unified diff hunks comparing additions (green) and deletions (red) between commit SHAs.
`,
      },
      {
        path: '03-interactive-blocks/runmdx-runner.mdx',
        content: `---
title: RunMDX In-Browser Code Sandboxes
category: Custom MDX Blocks
---

# RunMDX In-Browser Code Sandboxes

Docwyrm transforms static code blocks into executable interactive sandboxes.

## Live Code Sandbox

\`\`\`javascript
// Click ▶ Run in the top right to execute
const fibonacci = (n) => {
  let [a, b] = [0, 1];
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
};

console.log("Fibonacci(10):", fibonacci(10));
\`\`\`

Developers reading your documentation can tweak parameters, verify return values, and test algorithms without leaving the page.
`,
      },
      {
        path: '03-interactive-blocks/mermaid-diagrams.mdx',
        content: `---
title: Architecture & Sequence Diagrams
category: Custom MDX Blocks
---

# Architecture & Sequence Diagrams

Docwyrm includes first-class support for Mermaid diagramming. Flowcharts, sequence diagrams, class hierarchies, and git graphs render as native responsive SVG elements.

## Sequence Diagram Example

\`\`\`mermaid
sequenceDiagram
  autonumber
  actor Dev as Developer
  participant Studio as Docwyrm Studio
  participant Fastify as Fastify Engine
  participant Git as Git Repo

  Dev->>Studio: Edit MDX block
  Dev->>Studio: Click "Commit & Push"
  Studio->>Fastify: PUT /api/spaces/:id/docs/*
  Fastify->>Git: isomorphic-git.commit()
  Git-->>Fastify: SHA-1 Hash
  Fastify-->>Studio: 200 OK (Synced)
\`\`\`
`,
      },
      {
        path: '04-themes-and-motion/custom-themes.mdx',
        content: `---
title: Custom Theme Tokens & Studio Engine
category: Themes & Motion
---

# Custom Theme Tokens & Studio Engine

Docwyrm includes a built-in real-time theme engine. External developers can create and submit custom community themes to the Marketplace.

## Supported Themes

- **Docwyrm Classic**: Default engineering dark slate.
- **Tokyo Midnight**: Cyberpunk neon with electric cyan (\`#7aa2f7\`) and violet (\`#bb9af7\`).
- **Nordic Frost**: Scandinavian cold tones with icy cyan (\`#88c0d0\`).
- **Emerald Obsidian**: Deep forest obsidian (\`#09130e\`) with mint accents (\`#10b981\`).
- **Retro Terminal (Amber CRT)**: Vintage 1982 mainframe phosphor glow (\`#fbbf24\`).
- **Geist Minimalist**: Stark monochromatic black & white.
- **Sunset Vaporwave**: Twilight dusk canvas (\`#18122B\`) with coral neon (\`#FF6E91\`).

> [!TIP] Studio-Scoped
> Custom themes apply to the Documentation Studio and Reader, while the Landing Page remains in its crisp default white SaaS state.
`,
      },
      {
        path: '05-deployment/docker-compose.mdx',
        content: `---
title: Docker Compose Self-Hosting
category: Deployment & Self-Hosting
---

# Docker Compose Self-Hosting

Self-host Docwyrm on any VPS or private Kubernetes cluster using our official Docker Compose bundle.

\`\`\`yaml
version: '3.8'
services:
  docwyrm-api:
    image: ghcr.io/kurapiee/docwyrm-api:latest
    ports:
      - "4000:4000"
    volumes:
      - ./data:/app/.docwyrm_storage
    environment:
      - PORT=4000
      - FRONTEND_URL=http://localhost:3000

  docwyrm-web:
    image: ghcr.io/kurapiee/docwyrm-web:latest
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:4000
\`\`\`

Run with:
\`\`\`bash
docker compose up -d
\`\`\`
`,
      },
    ];

    for (const doc of book1Docs) {
      const fullPath = path.join(book1Dir, doc.path);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, doc.content, 'utf8');
      gitEngine.commitDoc(book1Dir, doc.path, doc.content, author, `docs: seed ${doc.path}`);
    }
  }

  // ============================================================================
  // BOOK 2: Docwyrm REST API Reference
  // ============================================================================
  const book2Id = 'docwyrm-api-reference';
  const book2Dir = path.join(storageRoot, book2Id);

  if (!spaces.has(book2Id)) {
    spaces.set(book2Id, {
      id: book2Id,
      projectId: 'proj-1',
      slug: 'api-reference',
      title: 'Docwyrm REST API Reference',
      gitProvider: 'GENERIC',
      gitRepoUrl: 'local',
      gitBranch: 'main',
      gitBasePath: '',
      syncStatus: 'IDLE',
      lastSyncedAt: new Date(),
    });

    const book2Docs = [
      {
        path: '01-authentication/overview.mdx',
        content: `---
title: API Authentication & Security
category: Authentication
---

# API Authentication & Security

All Docwyrm REST API endpoints are secured with cryptographic token validation and Path Traversal sanitization.

## Authentication Headers

Pass your token in the standard HTTP \`Authorization\` header:

\`\`\`http
Authorization: Bearer docwyrm_sec_98f41a...
Content-Type: application/json
\`\`\`

## OAuth 2.0 & CSRF State Security

Docwyrm uses a 32-byte cryptographic state map to protect GitHub OAuth flows against Cross-Site Request Forgery (CSRF). State tokens expire automatically after 10 minutes.
`,
      },
      {
        path: '02-spaces-and-books/spaces-crud.mdx',
        content: `---
title: Spaces & Free Tier 3-Book Limit
category: Spaces & Books
---

# Spaces & Books API (Free Tier Limit)

Manage documentation spaces / books. On the Docwyrm Free Tier, every user can create **up to 3 independent documentation books**.

## Endpoints

### 1. List All Books
\`GET /api/spaces\`

**Response:**
\`\`\`json
[
  {
    "id": "docwyrm-developer-guide",
    "title": "Docwyrm Developer Guide & SDK",
    "slug": "developer-guide",
    "gitBranch": "main",
    "syncStatus": "IDLE"
  }
]
\`\`\`

### 2. Create a New Book (Enforces 3-Book Limit)
\`POST /api/spaces\`

**Request Body:**
\`\`\`json
{
  "title": "Internal Engineering Handbook",
  "slug": "engineering-handbook"
}
\`\`\`

**Limit Exceeded Response (HTTP 403):**
\`\`\`json
{
  "error": "Free Tier limit reached. You can create up to 3 documentation books. Please delete an existing book to create a new one.",
  "limit": 3,
  "currentCount": 3
}
\`\`\`
`,
      },
      {
        path: '03-documents-and-content/documents-api.mdx',
        content: `---
title: Document CRUD & AST Serialization
category: Documents & MDX
---

# Documents & MDX AST API

Read, write, and delete markdown documents directly backed by Git commits.

## Read Document
\`GET /api/spaces/:id/docs/*\`

Returns the parsed AST blocks (\`heading\`, \`paragraph\`, \`code\`, \`callout\`), raw markdown content, and commit history.

## Save Document (Commit to Git)
\`PUT /api/spaces/:id/docs/*\`

\`\`\`json
{
  "rawContent": "# Updated Heading\\n\\nNew content.",
  "message": "docs: update quickstart guide",
  "author": {
    "name": "Docwyrm Team (@KuraPiee)",
    "email": "kurapiee@docwyrm.com"
  }
}
\`\`\`
`,
      },
    ];

    for (const doc of book2Docs) {
      const fullPath = path.join(book2Dir, doc.path);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, doc.content, 'utf8');
      gitEngine.commitDoc(book2Dir, doc.path, doc.content, author, `docs: seed ${doc.path}`);
    }
  }

  // ============================================================================
  // BOOK 3: Docwyrm Plugin Developer Kit
  // ============================================================================
  const book3Id = 'docwyrm-plugin-kit';
  const book3Dir = path.join(storageRoot, book3Id);

  if (!spaces.has(book3Id)) {
    spaces.set(book3Id, {
      id: book3Id,
      projectId: 'proj-1',
      slug: 'plugin-kit',
      title: 'Docwyrm Plugin Developer Kit',
      gitProvider: 'GENERIC',
      gitRepoUrl: 'local',
      gitBranch: 'main',
      gitBasePath: '',
      syncStatus: 'IDLE',
      lastSyncedAt: new Date(),
    });

    const book3Docs = [
      {
        path: '01-extension-core/plugin-lifecycle.mdx',
        content: `---
title: Plugin Architecture & AST Lifecycle
category: Extension Core
---

# Plugin Architecture & AST Lifecycle

Docwyrm provides a modular plugin system enabling custom block components, math engines, and interactive code executors.

## AST Transformation Hook

\`\`\`typescript
export interface DocwyrmPlugin {
  name: string;
  version: string;
  transformAst?: (ast: EditorBlock[]) => EditorBlock[];
  renderBlock?: (block: EditorBlock) => React.ReactNode;
}
\`\`\`

Plugins hook into the parse and render pipeline, converting custom code tags (e.g. \`\`\`mermaid\`\`\` or \`\`\`runmdx\`\`\`) into interactive React widgets.
`,
      },
      {
        path: '02-marketplace/publishing-extensions.mdx',
        content: `---
title: Publishing Extensions to Marketplace
category: Community Marketplace
---

# Publishing Extensions to Marketplace

Submit your custom themes, MDX block plugins, and animation primitives to the official Docwyrm Marketplace.

## Extension Manifest

Each extension requires a \`manifest.json\`:

\`\`\`json
{
  "name": "Amber CRT Theme",
  "version": "1.0.0",
  "category": "theme",
  "author": "Docwyrm Team (@KuraPiee)",
  "repository": "https://github.com/KuraPiee"
}
\`\`\`

Submit via Pull Request to \`packages/marketplace/registry.json\` or using the **Publish Extension** button in the Marketplace UI.
`,
      },
    ];

    for (const doc of book3Docs) {
      const fullPath = path.join(book3Dir, doc.path);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, doc.content, 'utf8');
      gitEngine.commitDoc(book3Dir, doc.path, doc.content, author, `docs: seed ${doc.path}`);
    }
  }
}
