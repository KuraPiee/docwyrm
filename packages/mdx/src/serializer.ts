import { EditorBlock } from '@docwyrm/types';
import { stringify as stringifyYaml } from 'yaml';

export function serializeMdx(
  blocks: EditorBlock[],
  frontmatter: Record<string, unknown> = {}
): string {
  const parts: string[] = [];

  // 1. Frontmatter
  if (Object.keys(frontmatter).length > 0) {
    const yamlStr = stringifyYaml(frontmatter).trim();
    parts.push(`---\n${yamlStr}\n---`);
  }

  // 2. Blocks
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
      case 'list': {
        const listItems = block.items.map((item, idx) =>
          block.ordered ? `${idx + 1}. ${item}` : `- ${item}`
        );
        parts.push(listItems.join('\n'));
        break;
      }
    }
  }

  return parts.join('\n\n') + '\n';
}
