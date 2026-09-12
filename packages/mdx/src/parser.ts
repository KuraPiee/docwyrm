import { EditorBlock, ParsedDoc } from '@docwyrm/types';
import { parse as parseYaml } from 'yaml';

export function parseMdx(rawContent: string): ParsedDoc {
  let content = rawContent.replace(/\r\n/g, '\n');
  let frontmatter: Record<string, unknown> = {};

  // 1. Extract YAML Frontmatter if present
  if (content.startsWith('---\n')) {
    const endIdx = content.indexOf('\n---\n', 4);
    if (endIdx !== -1) {
      const yamlStr = content.slice(4, endIdx);
      try {
        frontmatter = parseYaml(yamlStr) || {};
      } catch {
        frontmatter = {};
      }
      content = content.slice(endIdx + 5).trim();
    }
  }

  const lines = content.split('\n');
  const blocks: EditorBlock[] = [];
  let title = (frontmatter.title as string) || '';
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip blank lines between blocks
    if (!line.trim()) {
      i++;
      continue;
    }

    // 2. Headings (# H1 to #### H4)
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3 | 4;
      const text = headingMatch[2].trim();
      if (!title && level === 1) {
        title = text;
      }
      blocks.push({
        id: `h_${blocks.length}_${Math.random().toString(36).slice(2, 7)}`,
        type: 'heading',
        level,
        content: text,
      });
      i++;
      continue;
    }

    // 3. Code Blocks (```lang ... ```)
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim() || 'text';
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing ```
      blocks.push({
        id: `code_${blocks.length}_${Math.random().toString(36).slice(2, 7)}`,
        type: 'code',
        language: lang,
        code: codeLines.join('\n'),
      });
      continue;
    }

    // 4. Callouts / GitHub Alerts (> [!NOTE], > [!TIP], > [!WARNING], etc.)
    const alertMatch = line.match(/^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)$/i);
    if (alertMatch) {
      const variant = alertMatch[1].toLowerCase() as 'note' | 'tip' | 'important' | 'warning' | 'caution';
      const inlineTitle = alertMatch[2]?.trim() || undefined;
      i++;
      const calloutLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        calloutLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({
        id: `callout_${blocks.length}_${Math.random().toString(36).slice(2, 7)}`,
        type: 'callout',
        variant,
        title: inlineTitle,
        content: calloutLines.join('\n').trim(),
      });
      continue;
    }

    // 5. Images (![alt](url "caption"))
    const imageMatch = line.match(/^!\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)$/);
    if (imageMatch) {
      blocks.push({
        id: `img_${blocks.length}_${Math.random().toString(36).slice(2, 7)}`,
        type: 'image',
        alt: imageMatch[1],
        url: imageMatch[2],
        caption: imageMatch[3],
      });
      i++;
      continue;
    }

    // 6. Tables (| col | col |)
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      if (tableLines.length >= 2) {
        const headers = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());
        const rows = tableLines.slice(2).map((r) =>
          r
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim())
        );
        blocks.push({
          id: `tbl_${blocks.length}_${Math.random().toString(36).slice(2, 7)}`,
          type: 'table',
          headers,
          rows,
        });
        continue;
      }
    }

    // 7. Regular Paragraph (accumulate contiguous lines)
    const pLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].match(/^(#{1,4})\s/) &&
      !lines[i].startsWith('```') &&
      !lines[i].startsWith('> [!') &&
      !lines[i].match(/^!\[.*?\]\(.*?\)$/) &&
      !(lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|'))
    ) {
      pLines.push(lines[i]);
      i++;
    }

    if (pLines.length) {
      blocks.push({
        id: `p_${blocks.length}_${Math.random().toString(36).slice(2, 7)}`,
        type: 'paragraph',
        content: pLines.join('\n'),
      });
    }
  }

  if (!title && blocks.length && blocks[0].type === 'heading') {
    title = blocks[0].content;
  }

  return {
    frontmatter,
    title: title || 'Untitled',
    blocks,
    rawContent,
  };
}
