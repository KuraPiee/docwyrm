# Docwyrm Architecture Documentation

> **Docwyrm**: Open-source, Git-native, self-hostable documentation platform built as an advanced alternative to GitBook.

---

## 1. System Overview

`
+----------------------------------------------------------------------------------+
|                                    Docwyrm UI                                    |
|   Next.js 14 (App Router) · Block Editor · Git Tree Nav · Semantic Search · TOC  |
+------------------------+---------------------------------+-----------------------+
                         |                                 |
         WebSocket (Yjs) |                                 | HTTPS / REST (JWT)
                         v                                 v
+---------------------------------+       +----------------------------------------+
|          Collab Server          |       |               Fastify API              |
|   Hocuspocus · Yjs CRDT Server  |       | Auth · Orgs · Projects · Spaces · Rest |
+----------------+----------------+       +-------------------+--------------------+
                 |                                            |
                 +---------------------+----------------------+
                                       |
                                       v
+----------------------------------------------------------------------------------+
|                            PostgreSQL 16 + pgvector                              |
|   Multi-tenant: Orgs · Users · Spaces · Docs · Versions · Chunks & Embeddings    |
+----------------------------------------------------------------------------------+
                                       ^
                                       | Job Queue (Redis)
                                       v
+----------------------------------------------------------------------------------+
|                             Background Worker Pool                               |
|   Git Sync (isomorphic-git) · Vector Indexing (Gemini) · Changelogs · Transcribe |
+----------------------------------------------------------------------------------+
                                       ^
                                       | Git Pull / Push
                                       v
+----------------------------------------------------------------------------------+
|                       Remote Git Providers (GitHub / GitLab)                     |
|                   Docs stored as plain MDX files in repository                   |
+----------------------------------------------------------------------------------+
`

---

## 2. Monorepo Structure

- pps/web: Next.js 14 reader and interactive block editor.
- pps/api: Fastify backend handling authentication, RBAC, CRUD, and AI orchestration.
- pps/collab: Hocuspocus WebSocket server enabling multi-user real-time CRDT editing.
- pps/worker: BullMQ worker running git push/pull sync, vector embeddings, and changelog generators.
- packages/db: Database models, Prisma schema, and migrations for PostgreSQL + pgvector.
- packages/design-tokens: Shared Tailwind theme tokens, typography, CSS variables, and motion parameters.
- packages/git-sync: Isomorphic-git engine, tree parsing, 3-way conflict resolver, and commit builder.
- packages/types: Shared TypeScript interfaces across all applications and packages.
- packages/mdx: MDX parser, AST serializer, frontmatter extractor, and validator.

---

## 3. Database Schema (PostgreSQL + pgvector)

- **organizations**: Top-level tenant.
- **users**: Global user identity.
- **memberships**: User-to-organization RBAC (owner, dmin, editor, iewer).
- **projects**: Document project collections within an organization.
- **doc_spaces**: The fundamental unit. 1 Doc Space = 1 Git Repo / Branch / Base Path.
- **docs**: Individual nodes in the document tree (ile_path, slug, order_index, parent_id).
- **doc_versions**: Historical snapshots corresponding to specific Git commit SHAs.
- **embeddings**: Vector embeddings (ector(768)) generated via Gemini Embedding API for semantic search and RAG retrieval.
- **search_queries**: Analytics tracking queries, frequency, and content gap signals (had_good_answer = false).

---

## 4. Git-Native Synchronization Engine

1. **Mapping**: Each Doc Space connects to a remote Git URL, branch, and optional subdirectory (e.g. docs/).
2. **Edits to Git**:
   - In-editor changes are edited collaboratively in memory via Yjs and persisted to Postgres.
   - On explicit commit (or automated sync trigger), the worker converts MDX AST to raw files, writes a Git tree object, generates a commit, and pushes to remote.
3. **Git to Docs**:
   - Incoming webhook from GitHub/GitLab (or periodic worker poll) triggers a fetch.
   - The worker compares the remote HEAD SHA against last_synced_commit_sha.
   - If changed, it performs a 3-way tree merge:
     - **Clean merge**: Creates merge commit and updates database doc tree.
     - **Conflict**: Sets space status to conflict and displays an interactive 3-way resolution modal in the Docwyrm UI.

---

## 5. Design System Tokens & Motion

- **Light Mode**: Canvas #FFFFFF, Subtle #F6F8FA, Border #E1E4E8, Primary Text #1F2328, Muted Text #656D76, Focus Accent #0969DA.
- **Dark Mode**: Canvas #0D1117, Subtle #161B22, Border #21262D, Primary Text #E6EDF3, Muted Text #8B949E, Focus Accent #2F81F7.
- **Typography**: Geist (Prose, 15px, 1.65 line-height) + Geist Mono (Code, 13px, 1.55 line-height).
- **Signature Motion**: "Spatial Tree Reorder" with spring physics (stiffness: 420, damping: 28) and full prefers-reduced-motion compliance.

---

## 6. One-Command Self-Hosting

Run:
`ash
docker compose up -d
`
Spins up PostgreSQL (with pgvector), Redis, MinIO (S3 object store), Fastify API, Hocuspocus Collab server, Background Worker, and Next.js Web Frontend.
