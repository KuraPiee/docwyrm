const test = require('node:test');
const assert = require('node:assert');

test('Docwyrm API Integration Endpoints', async () => {
  // Set NODE_ENV to test to prevent server.listen
  process.env.NODE_ENV = 'test';

  const { buildServer } = await import('../src/server.ts');
  const server = buildServer();

  // 1. Health check
  const healthRes = await server.inject({ method: 'GET', url: '/api/health' });
  assert.strictEqual(healthRes.statusCode, 200);
  const health = JSON.parse(healthRes.payload);
  assert.strictEqual(health.status, 'healthy');

  // 2. Spaces list
  const spacesRes = await server.inject({ method: 'GET', url: '/api/spaces' });
  assert.strictEqual(spacesRes.statusCode, 200);
  const spaces = JSON.parse(spacesRes.payload);
  assert.strictEqual(spaces.length >= 1, true);

  // 3. Tree navigation
  const treeRes = await server.inject({ method: 'GET', url: '/api/spaces/default-space/tree' });
  if (treeRes.statusCode !== 200) console.error('Tree error payload:', treeRes.payload);
  assert.strictEqual(treeRes.statusCode, 200);
  const tree = JSON.parse(treeRes.payload);
  assert.strictEqual(Array.isArray(tree.tree), true);
  assert.strictEqual(tree.tree.length >= 1, true);

  // 4. Read doc
  const docRes = await server.inject({ method: 'GET', url: '/api/spaces/default-space/docs/index.mdx' });
  if (docRes.statusCode !== 200) console.error('Doc error payload:', docRes.payload);
  assert.strictEqual(docRes.statusCode, 200);
  const doc = JSON.parse(docRes.payload);
  assert.strictEqual(doc.title, 'Welcome to Docwyrm');
  assert.strictEqual(doc.blocks.length >= 4, true);

  // 5. Update doc (blocks editing -> Git commit)
  const updatedBlocks = [
    { id: 'b1', type: 'heading', level: 1, content: 'Updated Docwyrm Guide' },
    { id: 'b2', type: 'paragraph', content: 'New paragraph written from collaborative editor.' },
    { id: 'b3', type: 'callout', variant: 'tip', title: 'Performance Tip', content: 'Git diffs are cached.' },
  ];

  const updateRes = await server.inject({
    method: 'PUT',
    url: '/api/spaces/default-space/docs/index.mdx',
    payload: {
      blocks: updatedBlocks,
      message: 'docs: update guide with tip block',
      author: { name: 'Eren Ozdemir', email: 'eren@docwyrm.dev' },
    },
  });

  assert.strictEqual(updateRes.statusCode, 200);
  const updated = JSON.parse(updateRes.payload);
  assert.strictEqual(updated.success, true);
  assert.strictEqual(typeof updated.commitSha, 'string');
  assert.strictEqual(updated.title, 'Updated Docwyrm Guide');

  // 6. History
  const historyRes = await server.inject({ method: 'GET', url: '/api/spaces/default-space/history/index.mdx' });
  assert.strictEqual(historyRes.statusCode, 200);
  const history = JSON.parse(historyRes.payload);
  assert.strictEqual(history.history.length >= 2, true);
  const latestCommit = history.history[0].sha;
  const previousCommit = history.history[1].sha;

  // 7. Diff between commits
  const diffRes = await server.inject({
    method: 'GET',
    url: `/api/spaces/default-space/diff/index.mdx?from=${previousCommit}&to=${latestCommit}`,
  });
  assert.strictEqual(diffRes.statusCode, 200);
  const diffData = JSON.parse(diffRes.payload);
  assert.strictEqual(diffData.diff.hunks.length >= 1, true);

  // 8. Full text search
  const searchRes = await server.inject({
    method: 'GET',
    url: '/api/spaces/default-space/search?q=collaborative',
  });
  assert.strictEqual(searchRes.statusCode, 200);
  const search = JSON.parse(searchRes.payload);
  assert.strictEqual(search.results.length >= 1, true);
  assert.strictEqual(search.results[0].filePath, 'index.mdx');

  await server.close();
});
