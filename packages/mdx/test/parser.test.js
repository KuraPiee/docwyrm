const test = require('node:test');
const assert = require('node:assert');
const yaml = require('yaml');

function parseMdx(rawContent) {
  let content = rawContent.replace(/\r\n/g, '\n');
  let frontmatter = {};

  if (content.startsWith('---\n')) {
    const endIdx = content.indexOf('\n---\n', 4);
    if (endIdx !== -1) {
      const yamlStr = content.slice(4, endIdx);
      try { frontmatter = yaml.parse(yamlStr) || {}; } catch {}
      content = content.slice(endIdx + 5).trim();
    }
  }

  const lines = content.split('\n');
  const blocks = [];
  let title = frontmatter.title || '';
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      if (!title && level === 1) title = text;
      blocks.push({ type: 'heading', level, content: text });
      i++;
      continue;
    }

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim() || 'text';
      i++;
      const codeLines = [];
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;
      blocks.push({ type: 'code', language: lang, code: codeLines.join('\n') });
      continue;
    }

    const alertMatch = line.match(/^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)$/i);
    if (alertMatch) {
      const variant = alertMatch[1].toLowerCase();
      const inlineTitle = alertMatch[2]?.trim() || undefined;
      i++;
      const calloutLines = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        calloutLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'callout', variant, title: inlineTitle, content: calloutLines.join('\n').trim() });
      continue;
    }

    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      if (tableLines.length >= 2) {
        const headers = tableLines[0].split('|').slice(1, -1).map(c => c.trim());
        const rows = tableLines.slice(2).map(r => r.split('|').slice(1, -1).map(c => c.trim()));
        blocks.push({ type: 'table', headers, rows });
        continue;
      }
    }

    const imageMatch = line.match(/^!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)$/);
    if (imageMatch) {
      blocks.push({ type: 'image', alt: imageMatch[1], url: imageMatch[2], caption: imageMatch[3] });
      i++;
      continue;
    }

    const pLines = [];
    while (i < lines.length && lines[i].trim() && !lines[i].match(/^#{1,4}\s/) && !lines[i].startsWith('```') && !lines[i].startsWith('> [!') && !(lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) && !lines[i].match(/^!\[/)) {
      pLines.push(lines[i]);
      i++;
    }
    if (pLines.length) {
      blocks.push({ type: 'paragraph', content: pLines.join('\n') });
    }
  }

  return { frontmatter, title, blocks };
}

function serializeMdx(blocks, frontmatter = {}) {
  const parts = [];
  if (Object.keys(frontmatter).length > 0) {
    const yamlStr = yaml.stringify(frontmatter).trim();
    parts.push(`---\n${yamlStr}\n---`);
  }
  for (const block of blocks) {
    switch (block.type) {
      case 'heading': {
        const hashes = '#'.repeat(block.level);
        parts.push(`${hashes} ${block.content}`);
        break;
      }
      case 'paragraph': {
        parts.push(block.content);
        break;
      }
      case 'code': {
        const lang = block.language || '';
        parts.push(`\`\`\`${lang}\n${block.code}\n\`\`\``);
        break;
      }
      case 'callout': {
        const variantUpper = block.variant.toUpperCase();
        const header = block.title ? `> [!${variantUpper}] ${block.title}` : `> [!${variantUpper}]`;
        const bodyLines = block.content.split('\n').map((l) => `> ${l}`);
        parts.push([header, ...bodyLines].join('\n'));
        break;
      }
      case 'table': {
        const headerRow = `| ${block.headers.join(' | ')} |`;
        const delimiterRow = `| ${block.headers.map(() => '---').join(' | ')} |`;
        const rows = block.rows.map((r) => `| ${r.join(' | ')} |`);
        parts.push([headerRow, delimiterRow, ...rows].join('\n'));
        break;
      }
      case 'image': {
        const caption = block.caption ? ` "${block.caption}"` : '';
        parts.push(`![${block.alt || ''}](${block.url}${caption})`);
        break;
      }
    }
  }
  return parts.join('\n\n') + '\n';
}

test('MDX Parser and Serializer Roundtrip', () => {
  const sample = `---
title: Consensus Architecture
---

# Consensus Architecture

This document specifies the consensus protocol.

> [!NOTE] Invariant
> Nodes commit in monotonic order.

\`\`\`rust
pub struct RaftNode { id: u64 }
\`\`\`

| Node | Role |
| --- | --- |
| Alpha | Primary |

![Cluster](https://example.com/cluster.png "Topological overview")
`;

  const parsed = parseMdx(sample);
  assert.strictEqual(parsed.title, 'Consensus Architecture');
  assert.strictEqual(parsed.blocks.length, 6);
  assert.strictEqual(parsed.blocks[0].type, 'heading');
  assert.strictEqual(parsed.blocks[1].type, 'paragraph');
  assert.strictEqual(parsed.blocks[2].type, 'callout');
  assert.strictEqual(parsed.blocks[3].type, 'code');
  assert.strictEqual(parsed.blocks[4].type, 'table');
  assert.strictEqual(parsed.blocks[5].type, 'image');

  const serialized = serializeMdx(parsed.blocks, parsed.frontmatter);
  const reParsed = parseMdx(serialized);
  assert.strictEqual(reParsed.blocks.length, parsed.blocks.length);
  assert.strictEqual(reParsed.title, parsed.title);
});
