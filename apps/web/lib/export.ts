import { EditorBlock } from '@docwyrm/types';
import { serializeMdx } from '@docwyrm/mdx';

export function exportSingleDocAsMarkdown(title: string, blocks: EditorBlock[], filePath: string) {
  const content = serializeMdx(blocks, { title });
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filePath.replace(/\//g, '_');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printCleanDocument() {
  if (typeof window !== 'undefined') {
    window.print();
  }
}

export async function exportFullBook(apiUrl: string, spaceId: string) {
  try {
    const res = await fetch(`${apiUrl}/api/spaces/${spaceId}/export`);
    if (!res.ok) throw new Error('Failed to export book');
    const data = await res.json();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${spaceId}-full-export.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Book export failed:', err);
    return false;
  }
}
