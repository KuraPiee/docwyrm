export type UserRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
export type GitProvider = 'GITHUB' | 'GITLAB' | 'GENERIC';
export type SyncStatus = 'IDLE' | 'SYNCING' | 'ERROR' | 'CONFLICT';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  slug: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  organizationId: string;
  slug: string;
  name: string;
  description?: string;
  isPublic: boolean;
}

export interface DocSpace {
  id: string;
  projectId: string;
  slug: string;
  title: string;
  description?: string;
  isPrivate?: boolean;
  hasPassword?: boolean;
  passwordHash?: string;
  isSystemProtected?: boolean;
  themeId?: string;
  gitProvider: GitProvider;
  gitRepoUrl: string;
  gitBranch: string;
  gitBasePath: string;
  lastSyncedCommitSha?: string;
  syncStatus: SyncStatus;
  lastSyncError?: string;
  lastSyncedAt?: Date;
}

export interface DocNode {
  id: string;
  docSpaceId: string;
  parentId?: string;
  slug: string;
  title: string;
  filePath: string;
  orderIndex: number;
  isPublished: boolean;
  children?: DocNode[];
}

export interface DocVersion {
  id: string;
  docId: string;
  gitCommitSha: string;
  contentMdx: string;
  rawFrontmatter: Record<string, unknown>;
  authorName?: string;
  authorEmail?: string;
  committedAt: Date;
}

// Block Editor Types
export type BlockType = 
  | 'paragraph'
  | 'heading'
  | 'code'
  | 'callout'
  | 'table'
  | 'image'
  | 'list';

export interface BlockBase {
  id: string;
  type: BlockType;
}

export interface ParagraphBlock extends BlockBase {
  type: 'paragraph';
  content: string;
}

export interface HeadingBlock extends BlockBase {
  type: 'heading';
  level: 1 | 2 | 3 | 4;
  content: string;
}

export interface CodeBlock extends BlockBase {
  type: 'code';
  language: string;
  code: string;
  filename?: string;
}

export interface CalloutBlock extends BlockBase {
  type: 'callout';
  variant: 'note' | 'tip' | 'important' | 'warning' | 'caution';
  title?: string;
  content: string;
}

export interface TableBlock extends BlockBase {
  type: 'table';
  headers: string[];
  rows: string[][];
}

export interface ImageBlock extends BlockBase {
  type: 'image';
  url: string;
  alt?: string;
  caption?: string;
}

export interface ListBlock extends BlockBase {
  type: 'list';
  ordered: boolean;
  items: string[];
}

export type EditorBlock = 
  | ParagraphBlock
  | HeadingBlock
  | CodeBlock
  | CalloutBlock
  | TableBlock
  | ImageBlock
  | ListBlock;

export interface ParsedDoc {
  frontmatter: Record<string, unknown>;
  title: string;
  blocks: EditorBlock[];
  rawContent: string;
}

// Diff and Version History Types
export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: Array<{
    type: 'add' | 'delete' | 'context';
    content: string;
    oldLineNumber?: number;
    newLineNumber?: number;
  }>;
}

export interface FileDiff {
  oldPath?: string;
  newPath?: string;
  isNew?: boolean;
  isDeleted?: boolean;
  hunks: DiffHunk[];
}

export interface SearchResult {
  docId: string;
  slug: string;
  title: string;
  filePath: string;
  snippet: string;
  rank: number;
}
