# @docwyrm/spatial-motion

> **Physics-based spring animation primitives and spatial UI transitions for developer documentation and web apps.**  
> Crafted by [Docwyrm Team (@KuraPiee)](https://github.com/KuraPiee) for the open-source community.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## Features

- **Physics-Based Spring Curves**: Snappy, natural motion curves calculated from stiffness, damping, and mass.
- **Spatial Tree Accordions**: Zero-jitter expand and collapse transitions for complex document and file hierarchy trees.
- **Glassmorphism Diff Illumination**: Ambient glow effects for line-by-line Git additions and deletions.
- **Accessibility Native**: Automatically respects `prefers-reduced-motion` with instant zero-cost fallbacks.
- **Zero Dependencies**: Pure Web Animations API & CSS Custom Properties.

## Installation

```bash
npm install @docwyrm/spatial-motion
# or
pnpm add @docwyrm/spatial-motion
```

## Quick Start

```typescript
import { spatialTreeTransition, createSpringEasing } from '@docwyrm/spatial-motion';

// Animate a tree node expanding
const treeNode = document.getElementById('my-folder-children');
spatialTreeTransition(treeNode, true);

// Get a spring easing curve for CSS / Web Animations
const spring = createSpringEasing({ stiffness: 280, damping: 22 });
```

## License

MIT © [Docwyrm Team (@KuraPiee)](https://github.com/KuraPiee)
