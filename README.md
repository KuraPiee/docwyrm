<p align="center">
  <h1 align="center">🐉 Docwyrm</h1>
  <p align="center">
    <strong>The Git-Native, Self-Hostable Modern Documentation Platform</strong><br>
    <em>An uncompromising open-source alternative to GitBook — built for high-velocity engineering teams.</em>
  </p>
  <p align="center">
    <a href="https://docwyrm.com">Website</a> •
    <a href="https://github.com/KuraPiee/docwyrm">GitHub</a> •
    <a href="http://localhost:3000/docs">Live Studio Demo</a>
  </p>
</p>

---

## ✨ Key Features

- 📚 **3 Full Documentation Books on Free Tier**: Author up to 3 independent books with deep nested sections, pages, and sub-pages.
- 🔄 **Git-Native Bi-Directional Sync**: Native Git integration, automated commit tracking, branch switcher, and visual side-by-side diff viewer.
- 🎨 **Author-Locked Themes**: Readers experience the exact handcrafted atmosphere set by the author (Nordic Frost, Obsidian Night, Cyber Glow, Forest Moss, Solar Amber).
- 🌐 **Multilingual i18n Built-In**: Native localization supporting English, Spanish, German, French, and Turkish.
- ⌨️ **Instant Command Search (`Ctrl + K`)**: Lightning-fast offline full-text search across all documentation titles and body blocks.
- 📤 **Universal Exporting**: Export to clean Markdown (.mdx), printable high-fidelity PDF, or full book backup (.json).
- 🔒 **100% Self-Hostable & Privacy First**: Zero telemetries, complete SQLite/Git file-backed storage, full Docker and local orchestration support.

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/KuraPiee/docwyrm.git
cd docwyrm
pnpm install
```

### 2. Run Development Servers

```bash
pnpm dev
```

- **Landing Page & 3D Showcase**: `http://localhost:3000`
- **Documentation Studio**: `http://localhost:3000/docs`
- **Backend API & Git Sync Engine**: `http://localhost:4000`

---

## 🏛️ Architecture

```
docwyrm/
├── apps/
│   ├── web/               # Next.js 14 App Router (Landing, Studio, 3D Parallax, Auth)
│   └── api/               # Fastify backend, Git operations, sync & storage
├── packages/
│   ├── types/             # Shared TypeScript schemas & AST models
│   ├── design-tokens/     # Spatial color systems & typography tokens
│   ├── spatial-motion/    # Custom physics-based animation primitives
│   ├── git-sync/          # Git bi-directional synchronization library
│   ├── mdx/               # MDX parsing, AST serialization & compilation
│   └── search-engine/     # In-memory inverted index fuzzy search
```

---

## 📜 License & Legal Notice

Copyright (c) 2026 **Docwyrm Team** ([@KuraPiee](https://github.com/KuraPiee)). All rights reserved.

Licensed under the **Docwyrm Commercial Attribution License v1.0**.
- **Free for open source and commercial use** provided that attribution to **Docwyrm Team (@KuraPiee)** and link to [docwyrm.com](https://docwyrm.com) is clearly preserved in user-facing platforms.
- The **Docwyrm** trademark, name, and logo are protected and cannot be used to misrepresent third-party hosted distributions or unlawful activities.

See [`LICENSE`](./LICENSE) and [`LEGAL.md`](./LEGAL.md) for full legal terms.
