import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { DocSpace, DocNode, SearchResult, EditorBlock } from '@docwyrm/types';
import { parseMdx, serializeMdx } from '@docwyrm/mdx';
import { GitSyncEngine, computeDocDiff } from '@docwyrm/git-sync';
import { seedDeveloperBooks } from './seed';

// Path Traversal Security Helper
function sanitizeDocPath(baseDir: string, userPath: string): string | null {
  const normalized = path.normalize(userPath).replace(/^(\.\.[\/\\])+/, '');
  const resolved = path.resolve(baseDir, normalized);
  if (!resolved.startsWith(path.resolve(baseDir))) {
    return null;
  }
  return resolved;
}

// OAuth State Store for CSRF Defense (expires in 10 minutes)
interface OAuthStateEntry {
  state: string;
  createdAt: number;
}
const oauthStates = new Map<string, OAuthStateEntry>();

// Clean expired CSRF states
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of oauthStates.entries()) {
    if (now - val.createdAt > 10 * 60 * 1000) {
      oauthStates.delete(key);
    }
  }
}, 60 * 1000).unref();

export function buildServer() {
  const app = Fastify({ logger: false });
  const gitEngine = new GitSyncEngine();

  app.register(cors, { origin: true });
  app.register(helmet, { contentSecurityPolicy: false });

  // In-memory / filesystem repository store for self-hosted spaces
  const storageRoot = path.join(process.cwd(), '.docwyrm_storage');
  if (!fs.existsSync(storageRoot)) {
    fs.mkdirSync(storageRoot, { recursive: true });
  }

  const spaces = new Map<string, DocSpace>();

  // Seed the 3 Developer Documentation Books (Free Tier includes up to 3 books)
  seedDeveloperBooks(storageRoot, spaces, gitEngine);

  // Health check
  app.get('/api/health', async () => ({
    status: 'healthy',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  }));

  // --- AUTHENTICATION & GITHUB OAUTH ENDPOINTS ---

  // Initiate GitHub OAuth with CSRF state protection
  app.get('/api/auth/github', async (req, reply) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const callbackUrl = process.env.GITHUB_CALLBACK_URL || 'http://localhost:4000/api/auth/github/callback';

    if (!clientId) {
      return reply.send({
        configured: false,
        message: 'GITHUB_CLIENT_ID not set in environment. Use demo mode or configure GitHub OAuth in .env',
        authUrl: null,
      });
    }

    const state = crypto.randomBytes(32).toString('hex');
    oauthStates.set(state, { state, createdAt: Date.now() });

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      callbackUrl
    )}&scope=read:user,user:email&state=${state}`;

    return reply.redirect(githubAuthUrl);
  });

  // GitHub OAuth Callback with CSRF validation
  app.get('/api/auth/github/callback', async (req, reply) => {
    const { code, state } = req.query as { code?: string; state?: string };
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (!state || !oauthStates.has(state)) {
      return reply.status(403).send({
        error: 'Invalid or expired OAuth state parameter. Request rejected to prevent CSRF attacks.',
      });
    }
    oauthStates.delete(state);

    if (!code) {
      return reply.status(400).send({ error: 'Missing code parameter from GitHub' });
    }

    try {
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        return reply.status(401).send({ error: 'Failed to obtain access token from GitHub', details: tokenData });
      }

      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'Docwyrm-Platform',
        },
      });
      const userData = await userRes.json();

      return reply.redirect(
        `${frontendUrl}/docs?auth=success&user=${encodeURIComponent(userData.login || userData.name || 'user')}`
      );
    } catch (err: any) {
      return reply.status(500).send({ error: 'GitHub OAuth exchange failed', message: err.message });
    }
  });

  // Local login handler
  app.post('/api/auth/login', async (req, reply) => {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password required' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    return {
      success: true,
      token,
      user: {
        id: 'user-1',
        email,
        name: email.split('@')[0],
      },
    };
  });

  // Local register handler
  app.post('/api/auth/register', async (req, reply) => {
    const { email, password, name, org } = req.body as {
      email?: string;
      password?: string;
      name?: string;
      org?: string;
    };
    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password required' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    return {
      success: true,
      token,
      user: {
        id: 'user-new',
        email,
        name: name || email.split('@')[0],
        org: org || 'Default Workspace',
      },
    };
  });

  // --- DOCUMENTATION MANAGEMENT ENDPOINTS ---

  // List all doc spaces / books (returns count and max allowed)
  app.get('/api/spaces', async () => {
    return {
      spaces: Array.from(spaces.values()),
      count: spaces.size,
      maxAllowed: 3,
      tier: 'FREE_COMMUNITY',
    };
  });

  // Create new space / book (Enforces Free Tier 3-book limit)
  app.post('/api/spaces', async (req, reply) => {
    if (spaces.size >= 3) {
      return reply.status(403).send({
        error: 'Free Tier limit reached. You can create up to 3 documentation books. Please delete an existing book to create a new one.',
        limit: 3,
        currentCount: spaces.size,
      });
    }

    const { title, slug } = req.body as { title?: string; slug?: string };
    if (!title || !title.trim()) {
      return reply.status(400).send({ error: 'Book title is required' });
    }

    const cleanSlug = (slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-|-$/g, '') || `book-${Date.now()}`;
    const spaceId = `space-${cleanSlug}`;
    const repoDir = path.join(storageRoot, spaceId);

    fs.mkdirSync(repoDir, { recursive: true });
    const sectionDir = path.join(repoDir, '01-getting-started');
    fs.mkdirSync(sectionDir, { recursive: true });

    const initialMdx = `---
title: Welcome to ${title.trim()}
category: Getting Started
---

# Welcome to ${title.trim()}

This is your new documentation book.

> [!NOTE] Free Tier Book
> You are using ${spaces.size + 1} of your 3 included books on the Docwyrm Free Tier.

## Next Steps

Use the sidebar on the left to add chapters, sections, and nested sub-pages.
`;
    const indexPath = path.join(sectionDir, 'index.mdx');
    fs.writeFileSync(indexPath, initialMdx, 'utf8');

    await gitEngine.commitDoc(
      repoDir,
      '01-getting-started/index.mdx',
      initialMdx,
      { name: 'KuraPiee', email: 'kurapiee@docwyrm.com' },
      'docs: initialize documentation book'
    );

    const newSpace: DocSpace = {
      id: spaceId,
      projectId: 'proj-1',
      slug: cleanSlug,
      title: title.trim(),
      gitProvider: 'GENERIC',
      gitRepoUrl: 'local',
      gitBranch: 'main',
      gitBasePath: '',
      syncStatus: 'IDLE',
      lastSyncedAt: new Date(),
    };

    spaces.set(spaceId, newSpace);

    return {
      success: true,
      space: newSpace,
      count: spaces.size,
      maxAllowed: 3,
    };
  });

  // Delete documentation book
  app.delete('/api/spaces/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    if (!spaces.has(id)) {
      return reply.status(404).send({ error: 'Book not found' });
    }
    if (spaces.size <= 1) {
      return reply.status(400).send({ error: 'Cannot delete the only remaining documentation book in your workspace.' });
    }

    spaces.delete(id);
    const repoDir = path.join(storageRoot, id);
    try {
      if (fs.existsSync(repoDir)) {
        fs.rmSync(repoDir, { recursive: true, force: true });
      }
    } catch (e) {
      console.error(e);
    }

    return {
      success: true,
      deletedSpaceId: id,
      count: spaces.size,
      maxAllowed: 3,
    };
  });

  // Create new section (Chapter / Folder)
  app.post('/api/spaces/:id/sections', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { sectionName } = req.body as { sectionName?: string };
    const space = spaces.get(id);
    if (!space) return reply.status(404).send({ error: 'Space not found' });
    if (!sectionName) return reply.status(400).send({ error: 'sectionName is required' });

    const cleanName = sectionName.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');
    const repoDir = path.join(storageRoot, id);
    const sectionDir = path.join(repoDir, cleanName);

    fs.mkdirSync(sectionDir, { recursive: true });

    // Create an index.mdx inside the new section
    const initialMdx = `---
title: ${sectionName}
category: ${sectionName}
---

# ${sectionName}

Overview for this chapter. Add sub-pages using the sidebar.
`;
    const filePath = `${cleanName}/index.mdx`;
    fs.writeFileSync(path.join(repoDir, filePath), initialMdx, 'utf8');

    await gitEngine.commitDoc(
      repoDir,
      filePath,
      initialMdx,
      { name: 'KuraPiee', email: 'kurapiee@docwyrm.com' },
      `docs: create section ${sectionName}`
    );

    return {
      success: true,
      sectionPath: cleanName,
      initialDoc: filePath,
    };
  });

  // Create new sub-page under section or root
  app.post('/api/spaces/:id/pages', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { section, pageTitle } = req.body as { section?: string; pageTitle?: string };
    const space = spaces.get(id);
    if (!space) return reply.status(404).send({ error: 'Space not found' });
    if (!pageTitle) return reply.status(400).send({ error: 'pageTitle is required' });

    const slug = pageTitle.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');
    const repoDir = path.join(storageRoot, id);
    const relDir = section ? section.replace(/^[/\\]+|[/\\]+$/g, '') : '';
    const fullDir = path.join(repoDir, relDir);

    fs.mkdirSync(fullDir, { recursive: true });

    const fileName = `${slug}.mdx`;
    const relFilePath = relDir ? `${relDir}/${fileName}` : fileName;
    const fullPath = path.join(repoDir, relFilePath);

    if (fs.existsSync(fullPath)) {
      return reply.status(409).send({ error: 'A document with this name already exists in this section.' });
    }

    const initialMdx = `---
title: ${pageTitle}
category: ${section || 'General'}
---

# ${pageTitle}

Start writing your technical documentation here.
`;
    fs.writeFileSync(fullPath, initialMdx, 'utf8');

    await gitEngine.commitDoc(
      repoDir,
      relFilePath,
      initialMdx,
      { name: 'KuraPiee', email: 'kurapiee@docwyrm.com' },
      `docs: add page ${pageTitle}`
    );

    return {
      success: true,
      filePath: relFilePath,
      title: pageTitle,
    };
  });

  app.get('/api/spaces/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const space = spaces.get(id);
    if (!space) return reply.status(404).send({ error: 'Space not found' });
    return space;
  });

  // Get doc navigation tree
  app.get('/api/spaces/:id/tree', async (req, reply) => {
    const { id } = req.params as { id: string };
    const space = spaces.get(id);
    if (!space) return reply.status(404).send({ error: 'Space not found' });

    const repoDir = path.join(storageRoot, id);
    const tree = gitEngine.scanDocTree(repoDir);
    return { spaceId: id, tree };
  });

  // Read a single doc (Path Traversal Protected)
  app.get('/api/spaces/:id/docs/*', async (req, reply) => {
    const { id } = req.params as { id: string };
    const filePath = (req.params as any)['*'] as string;
    const space = spaces.get(id);
    if (!space) return reply.status(404).send({ error: 'Space not found' });

    const repoDir = path.join(storageRoot, id);
    const fullPath = sanitizeDocPath(repoDir, filePath);

    if (!fullPath) {
      return reply.status(400).send({ error: 'Invalid path: path traversal detected' });
    }

    if (!fs.existsSync(fullPath)) {
      return reply.status(404).send({ error: 'Document not found' });
    }

    const raw = fs.readFileSync(fullPath, 'utf8');
    const parsed = parseMdx(raw);
    const history = await gitEngine.getCommitHistory(repoDir, filePath, 5);

    return {
      filePath,
      title: parsed.title,
      frontmatter: parsed.frontmatter,
      blocks: parsed.blocks,
      rawContent: raw,
      latestCommit: history[0] || null,
    };
  });

  // Save/commit doc changes (Path Traversal Protected)
  app.put('/api/spaces/:id/docs/*', async (req, reply) => {
    const { id } = req.params as { id: string };
    const filePath = (req.params as any)['*'] as string;
    const body = req.body as {
      blocks?: EditorBlock[];
      rawContent?: string;
      frontmatter?: Record<string, unknown>;
      message?: string;
      author?: { name: string; email: string };
    };

    const space = spaces.get(id);
    if (!space) return reply.status(404).send({ error: 'Space not found' });

    const repoDir = path.join(storageRoot, id);
    const fullPath = sanitizeDocPath(repoDir, filePath);

    if (!fullPath) {
      return reply.status(400).send({ error: 'Invalid path: path traversal detected' });
    }

    let mdxToWrite = '';

    if (body.blocks) {
      mdxToWrite = serializeMdx(body.blocks, body.frontmatter || {});
    } else if (body.rawContent) {
      mdxToWrite = body.rawContent;
    } else {
      return reply.status(400).send({ error: 'Must provide either blocks or rawContent' });
    }

    const author = body.author || { name: 'KuraPiee', email: 'kurapiee@docwyrm.com' };
    const message = body.message || `docs: update ${filePath}`;

    const commitSha = await gitEngine.commitDoc(
      repoDir,
      filePath,
      mdxToWrite,
      author,
      message
    );

    space.lastSyncedCommitSha = commitSha;
    space.lastSyncedAt = new Date();

    const parsed = parseMdx(mdxToWrite);

    return {
      success: true,
      commitSha,
      filePath,
      title: parsed.title,
      blocks: parsed.blocks,
    };
  });

  // Delete a doc and commit to Git
  app.delete('/api/spaces/:id/docs/*', async (req, reply) => {
    const { id } = req.params as { id: string };
    const filePath = (req.params as any)['*'] as string;
    const space = spaces.get(id);
    if (!space) return reply.status(404).send({ error: 'Space not found' });

    const repoDir = path.join(storageRoot, id);
    const fullPath = sanitizeDocPath(repoDir, filePath);
    if (!fullPath) return reply.status(400).send({ error: 'Invalid path' });

    if (!fs.existsSync(fullPath)) {
      return reply.status(404).send({ error: 'Document does not exist' });
    }

    const author = { name: 'KuraPiee', email: 'kurapiee@docwyrm.com' };
    const commitSha = await gitEngine.deleteDoc(
      repoDir,
      filePath,
      author,
      `docs: delete ${filePath}`
    );

    space.lastSyncedCommitSha = commitSha;
    space.lastSyncedAt = new Date();

    return {
      success: true,
      deletedFilePath: filePath,
      commitSha,
    };
  });

  // List Git Branches
  app.get('/api/spaces/:id/branches', async (req, reply) => {
    const { id } = req.params as { id: string };
    const space = spaces.get(id);
    if (!space) return reply.status(404).send({ error: 'Space not found' });

    const repoDir = path.join(storageRoot, id);
    const branches = await gitEngine.listBranches(repoDir);
    return {
      currentBranch: space.gitBranch || 'main',
      branches,
    };
  });

  // Create new Git Branch
  app.post('/api/spaces/:id/branches', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { branchName } = req.body as { branchName: string };
    if (!branchName) return reply.status(400).send({ error: 'branchName is required' });

    const space = spaces.get(id);
    if (!space) return reply.status(404).send({ error: 'Space not found' });

    const repoDir = path.join(storageRoot, id);
    await gitEngine.createBranch(repoDir, branchName);
    return { success: true, branch: branchName };
  });

  // Switch Git Branch
  app.post('/api/spaces/:id/checkout', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { branchName } = req.body as { branchName: string };
    if (!branchName) return reply.status(400).send({ error: 'branchName is required' });

    const space = spaces.get(id);
    if (!space) return reply.status(404).send({ error: 'Space not found' });

    const repoDir = path.join(storageRoot, id);
    await gitEngine.checkoutBranch(repoDir, branchName);
    space.gitBranch = branchName;
    return { success: true, activeBranch: branchName };
  });

  // Export entire doc space as structured JSON bundle
  app.get('/api/spaces/:id/export', async (req, reply) => {
    const { id } = req.params as { id: string };
    const space = spaces.get(id);
    if (!space) return reply.status(404).send({ error: 'Space not found' });

    const repoDir = path.join(storageRoot, id);
    const files: Array<{ path: string; content: string }> = [];

    function collectFiles(dir: string, rel: string = '') {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        const relPath = rel ? `${rel}/${entry.name}` : entry.name;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          collectFiles(full, relPath);
        } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
          files.push({
            path: relPath,
            content: fs.readFileSync(full, 'utf8'),
          });
        }
      }
    }

    collectFiles(repoDir);

    return {
      spaceId: id,
      title: space.title,
      exportedAt: new Date().toISOString(),
      fileCount: files.length,
      files,
    };
  });

  // Get version history for a doc
  app.get('/api/spaces/:id/history/*', async (req, reply) => {
    const { id } = req.params as { id: string };
    const filePath = (req.params as any)['*'] as string;
    const repoDir = path.join(storageRoot, id);

    if (!fs.existsSync(repoDir)) return reply.status(404).send({ error: 'Space not found' });

    const safe = sanitizeDocPath(repoDir, filePath);
    if (!safe) return reply.status(400).send({ error: 'Invalid path' });

    const history = await gitEngine.getCommitHistory(repoDir, filePath, 25);
    return { filePath, history };
  });

  // Compute diff between two commits for a doc
  app.get('/api/spaces/:id/diff/*', async (req, reply) => {
    const { id } = req.params as { id: string };
    const filePath = (req.params as any)['*'] as string;
    const { from, to } = req.query as { from: string; to: string };
    const repoDir = path.join(storageRoot, id);

    if (!from || !to) {
      return reply.status(400).send({ error: 'from and to commit SHAs required' });
    }

    const safe = sanitizeDocPath(repoDir, filePath);
    if (!safe) return reply.status(400).send({ error: 'Invalid path' });

    const diff = await gitEngine.getDiffBetweenCommits(repoDir, from, to, filePath);
    return { filePath, from, to, diff };
  });

  // Full-text search across docs
  app.get('/api/spaces/:id/search', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { q } = req.query as { q?: string };
    if (!q || !q.trim()) return { results: [] };

    const repoDir = path.join(storageRoot, id);
    const query = q.toLowerCase();
    const results: SearchResult[] = [];

    function searchDir(dir: string, rel: string = '') {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        const relPath = rel ? `${rel}/${entry.name}` : entry.name;
        const full = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          searchDir(full, relPath);
        } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
          const content = fs.readFileSync(full, 'utf8');
          const lower = content.toLowerCase();
          const matchIdx = lower.indexOf(query);

          if (matchIdx !== -1) {
            const start = Math.max(0, matchIdx - 40);
            const end = Math.min(content.length, matchIdx + query.length + 60);
            const snippet = '...' + content.slice(start, end).replace(/\n/g, ' ') + '...';
            const parsed = parseMdx(content);

            results.push({
              docId: relPath,
              slug: entry.name.replace(/\.(md|mdx)$/, ''),
              title: parsed.title || relPath,
              filePath: relPath,
              snippet,
              rank: 1,
            });
          }
        }
      }
    }

    if (fs.existsSync(repoDir)) {
      searchDir(repoDir);
    }

    return { query: q, results };
  });

  // --- Self-Hosted Documentation Analytics Engine ---
  const analyticsFile = path.join(storageRoot, 'analytics_store.json');
  interface StoredAnalytics {
    [spaceId: string]: {
      totalViews: number;
      uniqueVisitors: string[];
      helpfulYes: number;
      helpfulNo: number;
      totalDurationSeconds: number;
      pages: {
        [filePath: string]: {
          views: number;
          helpfulYes: number;
          helpfulNo: number;
          durationSeconds: number;
        };
      };
    };
  }

  function loadAnalytics(): StoredAnalytics {
    try {
      if (fs.existsSync(analyticsFile)) {
        return JSON.parse(fs.readFileSync(analyticsFile, 'utf8'));
      }
    } catch (e) {
      console.error('Failed reading analytics:', e);
    }
    return {};
  }

  function saveAnalytics(data: StoredAnalytics) {
    try {
      fs.writeFileSync(analyticsFile, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed writing analytics:', e);
    }
  }

  // Record an analytics event (page view, time spent, or helpful vote)
  app.post('/api/spaces/:id/analytics/event', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = req.body as {
      type: 'page_view' | 'feedback' | 'time_spent';
      filePath: string;
      helpful?: boolean;
      seconds?: number;
      visitorId?: string;
    };

    if (!body || !body.filePath) {
      return reply.status(400).send({ error: 'filePath and type required' });
    }

    const all = loadAnalytics();
    if (!all[id]) {
      all[id] = {
        totalViews: 0,
        uniqueVisitors: [],
        helpfulYes: 0,
        helpfulNo: 0,
        totalDurationSeconds: 0,
        pages: {},
      };
    }

    const spaceData = all[id];
    if (!spaceData.pages[body.filePath]) {
      spaceData.pages[body.filePath] = {
        views: 0,
        helpfulYes: 0,
        helpfulNo: 0,
        durationSeconds: 0,
      };
    }

    const pageData = spaceData.pages[body.filePath];

    if (body.type === 'page_view') {
      spaceData.totalViews += 1;
      pageData.views += 1;
      if (body.visitorId && !spaceData.uniqueVisitors.includes(body.visitorId)) {
        spaceData.uniqueVisitors.push(body.visitorId);
      }
    } else if (body.type === 'feedback') {
      if (body.helpful === true) {
        spaceData.helpfulYes += 1;
        pageData.helpfulYes += 1;
      } else if (body.helpful === false) {
        spaceData.helpfulNo += 1;
        pageData.helpfulNo += 1;
      }
    } else if (body.type === 'time_spent' && typeof body.seconds === 'number') {
      const sec = Math.max(0, Math.min(3600, Math.round(body.seconds)));
      spaceData.totalDurationSeconds += sec;
      pageData.durationSeconds += sec;
    }

    saveAnalytics(all);
    return { success: true, recorded: body.type };
  });

  // Get aggregated stats for space
  app.get('/api/spaces/:id/stats', async (req, reply) => {
    const { id } = req.params as { id: string };
    const all = loadAnalytics();
    const data = all[id] || {
      totalViews: 0,
      uniqueVisitors: [],
      helpfulYes: 0,
      helpfulNo: 0,
      totalDurationSeconds: 0,
      pages: {},
    };

    const totalVotes = data.helpfulYes + data.helpfulNo;
    const helpfulRatio = totalVotes > 0 ? Math.round((data.helpfulYes / totalVotes) * 100) : 100;
    const avgSeconds = data.totalViews > 0 ? Math.round(data.totalDurationSeconds / data.totalViews) : 0;

    // Format top pages
    const topPages = Object.entries(data.pages)
      .map(([filePath, stats]) => ({
        filePath,
        views: stats.views,
        helpful: stats.helpfulYes,
        unhelpful: stats.helpfulNo,
        avgDurationSec: stats.views > 0 ? Math.round(stats.durationSeconds / stats.views) : 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    return {
      spaceId: id,
      totalViews: data.totalViews,
      uniqueVisitors: data.uniqueVisitors.length,
      helpfulScore: {
        positive: data.helpfulYes,
        negative: data.helpfulNo,
        percentage: helpfulRatio,
      },
      avgReadTimeSeconds: avgSeconds,
      totalDurationSeconds: data.totalDurationSeconds,
      topDocuments: topPages,
      selfHostedPrivacyNotice:
        '100% self-hosted metrics stored in .docwyrm_storage. Zero external tracking or telemetry.',
      apiDocumentation: 'Query this live via GET /api/spaces/' + id + '/stats',
    };
  });


  return app;
}

if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT) || 4000;
  const server = buildServer();
  server.listen({ port, host: '0.0.0.0' }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Docwyrm API listening at ${address}`);
  });
}
