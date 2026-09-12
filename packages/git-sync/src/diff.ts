import * as Diff from 'diff';
import { FileDiff, DiffHunk } from '@docwyrm/types';

export function computeDocDiff(
  oldContent: string,
  newContent: string,
  oldPath: string = 'previous.mdx',
  newPath: string = 'current.mdx'
): FileDiff {
  const patch = Diff.structuredPatch(
    oldPath,
    newPath,
    oldContent.replace(/\r\n/g, '\n'),
    newContent.replace(/\r\n/g, '\n'),
    '',
    '',
    { context: 3 }
  );

  const hunks: DiffHunk[] = patch.hunks.map((hunk) => {
    let oldLine = hunk.oldStart;
    let newLine = hunk.newStart;

    const lines = hunk.lines.map((rawLine) => {
      const prefix = rawLine[0];
      const content = rawLine.slice(1);

      if (prefix === '+') {
        const line = {
          type: 'add' as const,
          content,
          newLineNumber: newLine,
        };
        newLine++;
        return line;
      } else if (prefix === '-') {
        const line = {
          type: 'delete' as const,
          content,
          oldLineNumber: oldLine,
        };
        oldLine++;
        return line;
      } else {
        const line = {
          type: 'context' as const,
          content,
          oldLineNumber: oldLine,
          newLineNumber: newLine,
        };
        oldLine++;
        newLine++;
        return line;
      }
    });

    return {
      oldStart: hunk.oldStart,
      oldLines: hunk.oldLines,
      newStart: hunk.newStart,
      newLines: hunk.newLines,
      lines,
    };
  });

  return {
    oldPath,
    newPath,
    isNew: oldContent.trim().length === 0,
    isDeleted: newContent.trim().length === 0,
    hunks,
  };
}
