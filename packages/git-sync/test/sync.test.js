const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const git = require('isomorphic-git');
const Diff = require('diff');

// In-test engine implementation test
function computeDocDiff(oldContent, newContent, oldPath = 'prev', newPath = 'curr') {
  const patch = Diff.structuredPatch(oldPath, newPath, oldContent.replace(/\r\n/g, '\n'), newContent.replace(/\r\n/g, '\n'), '', '', { context: 3 });
  return {
    hunks: patch.hunks.map(h => ({
      lines: h.lines.map(l => ({ type: l[0] === '+' ? 'add' : l[0] === '-' ? 'delete' : 'context', content: l.slice(1) }))
    }))
  };
}

test('Git Sync Engine: Commit, Log, and Diff calculation', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'docwyrm-test-'));
  
  try {
    // 1. Init repo
    await git.init({ fs, dir: tempDir, defaultBranch: 'main' });
    assert.strictEqual(fs.existsSync(path.join(tempDir, '.git')), true);

    // 2. Commit initial doc
    const filePath = 'getting-started.mdx';
    const v1Content = `# Getting Started\n\nWelcome to Docwyrm.\n`;
    fs.writeFileSync(path.join(tempDir, filePath), v1Content, 'utf8');
    await git.add({ fs, dir: tempDir, filepath: filePath });
    const commit1 = await git.commit({
      fs,
      dir: tempDir,
      author: { name: 'KuraPiee', email: 'kurapiee@docwyrm.com', timestamp: 1700000000 },
      message: 'docs: initial getting started doc'
    });
    assert.strictEqual(typeof commit1, 'string');

    // 3. Commit updated doc
    const v2Content = `# Getting Started\n\nWelcome to Docwyrm, the Git-native docs platform.\n\n> [!NOTE]\n> Self-host with Docker.\n`;
    fs.writeFileSync(path.join(tempDir, filePath), v2Content, 'utf8');
    await git.add({ fs, dir: tempDir, filepath: filePath });
    const commit2 = await git.commit({
      fs,
      dir: tempDir,
      author: { name: 'KuraPiee', email: 'kurapiee@docwyrm.com', timestamp: 1700000100 },
      message: 'docs: add self-host note'
    });

    // 4. Log history
    const commits = await git.log({ fs, dir: tempDir, filepath: filePath });
    assert.strictEqual(commits.length, 2);
    assert.strictEqual(commits[0].commit.message.trim(), 'docs: add self-host note');
    assert.strictEqual(commits[1].commit.message.trim(), 'docs: initial getting started doc');

    // 5. Diff between commits
    const diff = computeDocDiff(v1Content, v2Content);
    assert.strictEqual(diff.hunks.length > 0, true);
    const addedLines = diff.hunks[0].lines.filter(l => l.type === 'add');
    const deletedLines = diff.hunks[0].lines.filter(l => l.type === 'delete');
    assert.strictEqual(addedLines.length >= 2, true);
    assert.strictEqual(deletedLines.length >= 1, true);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
