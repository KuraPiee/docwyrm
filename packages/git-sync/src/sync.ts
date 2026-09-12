import fs from 'node:fs';
import path from 'node:path';
import git from 'isomorphic-git';
import { DocNode, DocVersion, FileDiff } from '@docwyrm/types';
import { parseMdx } from '@docwyrm/mdx';
import { computeDocDiff } from './diff';

export class GitSyncEngine {
  constructor(private fsImpl: typeof fs = fs) {}

  async initRepo(repoDir: string, defaultBranch: string = 'main'): Promise<void> {
    if (!this.fsImpl.existsSync(path.join(repoDir, '.git'))) {
      await git.init({ fs: this.fsImpl, dir: repoDir, defaultBranch });
    }
  }

  async commitDoc(
    repoDir: string,
    filePath: string,
    contentMdx: string,
    author: { name: string; email: string },
    message: string
  ): Promise<string> {
    await this.initRepo(repoDir);
    const fullPath = path.join(repoDir, filePath);
    const parentDir = path.dirname(fullPath);

    if (!this.fsImpl.existsSync(parentDir)) {
      this.fsImpl.mkdirSync(parentDir, { recursive: true });
    }

    this.fsImpl.writeFileSync(fullPath, contentMdx, 'utf8');

    await git.add({
      fs: this.fsImpl,
      dir: repoDir,
      filepath: filePath,
    });

    const sha = await git.commit({
      fs: this.fsImpl,
      dir: repoDir,
      author: {
        name: author.name,
        email: author.email,
        timestamp: Math.floor(Date.now() / 1000),
      },
      message,
    });

    return sha;
  }

  async getCommitHistory(
    repoDir: string,
    filePath?: string,
    depth: number = 20
  ): Promise<Array<{ sha: string; message: string; author: string; email: string; timestamp: Date }>> {
    await this.initRepo(repoDir);
    const commits = await git.log({
      fs: this.fsImpl,
      dir: repoDir,
      depth,
      filepath: filePath,
    });

    return commits.map((c) => ({
      sha: c.oid,
      message: c.commit.message.trim(),
      author: c.commit.author.name,
      email: c.commit.author.email,
      timestamp: new Date(c.commit.author.timestamp * 1000),
    }));
  }

  async getFileAtCommit(repoDir: string, commitSha: string, filePath: string): Promise<string> {
    const { blob } = await git.readBlob({
      fs: this.fsImpl,
      dir: repoDir,
      oid: commitSha,
      filepath: filePath,
    });

    return Buffer.from(blob).toString('utf8');
  }

  async getDiffBetweenCommits(
    repoDir: string,
    oldCommitSha: string,
    newCommitSha: string,
    filePath: string
  ): Promise<FileDiff> {
    let oldContent = '';
    try {
      oldContent = await this.getFileAtCommit(repoDir, oldCommitSha, filePath);
    } catch {
      oldContent = '';
    }

    let newContent = '';
    try {
      newContent = await this.getFileAtCommit(repoDir, newCommitSha, filePath);
    } catch {
      newContent = '';
    }

    return computeDocDiff(oldContent, newContent, `${filePath}@${oldCommitSha.slice(0, 7)}`, `${filePath}@${newCommitSha.slice(0, 7)}`);
  }

  scanDocTree(baseDir: string, relativeDir: string = ''): DocNode[] {
    const currentDir = path.join(baseDir, relativeDir);
    if (!this.fsImpl.existsSync(currentDir)) return [];

    const entries = this.fsImpl.readdirSync(currentDir, { withFileTypes: true });
    const nodes: DocNode[] = [];

    let order = 0;
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

      const relPath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        const children = this.scanDocTree(baseDir, relPath);
        nodes.push({
          id: `dir_${relPath}`,
          docSpaceId: '',
          slug: entry.name,
          title: entry.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          filePath: relPath,
          orderIndex: order++,
          isPublished: true,
          children,
        });
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
        const raw = this.fsImpl.readFileSync(path.join(baseDir, relPath), 'utf8');
        const parsed = parseMdx(raw);
        const slug = entry.name.replace(/\.(md|mdx)$/, '');

        nodes.push({
          id: `doc_${relPath}`,
          docSpaceId: '',
          slug,
          title: parsed.title || slug,
          filePath: relPath,
          orderIndex: order++,
          isPublished: true,
        });
      }
    }

    return nodes;
  }

  async deleteDoc(
    repoDir: string,
    filePath: string,
    author: { name: string; email: string },
    message: string
  ): Promise<string> {
    await this.initRepo(repoDir);
    const fullPath = path.join(repoDir, filePath);
    if (this.fsImpl.existsSync(fullPath)) {
      this.fsImpl.unlinkSync(fullPath);
    }
    await git.remove({
      fs: this.fsImpl,
      dir: repoDir,
      filepath: filePath,
    });
    const sha = await git.commit({
      fs: this.fsImpl,
      dir: repoDir,
      author: {
        name: author.name,
        email: author.email,
        timestamp: Math.floor(Date.now() / 1000),
      },
      message,
    });
    return sha;
  }

  async listBranches(repoDir: string): Promise<string[]> {
    await this.initRepo(repoDir);
    const branches = await git.listBranches({ fs: this.fsImpl, dir: repoDir });
    return branches.length > 0 ? branches : ['main'];
  }

  async createBranch(repoDir: string, ref: string): Promise<void> {
    await this.initRepo(repoDir);
    await git.branch({ fs: this.fsImpl, dir: repoDir, ref });
  }

  async checkoutBranch(repoDir: string, ref: string): Promise<void> {
    await this.initRepo(repoDir);
    await git.checkout({ fs: this.fsImpl, dir: repoDir, ref });
  }
}
