import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { SolutionFileRef } from './chapter-utils';

export interface LoadedSolutionFile {
  filename: string;
  lang: string;
  code: string;
}

export function resolveSolutionPath(
  sourcePath: string,
  rootDir = process.cwd(),
): string {
  if (sourcePath.trim() === '' || path.isAbsolute(sourcePath)) {
    throw new Error(
      `Invalid solution path: "${sourcePath}" must be a relative path inside solutions/`,
    );
  }

  const solutionsRoot = path.resolve(rootDir, 'solutions');
  const resolved = path.resolve(solutionsRoot, sourcePath);
  const allowedPrefix = `${solutionsRoot}${path.sep}`;

  if (!resolved.startsWith(allowedPrefix)) {
    throw new Error(
      `Solution path escapes solutions/ directory: "${sourcePath}"`,
    );
  }

  return resolved;
}

export function loadSolutionFiles(
  files: readonly SolutionFileRef[],
  rootDir = process.cwd(),
): LoadedSolutionFile[] {
  return files.map((file) => {
    const absolutePath = resolveSolutionPath(file.sourcePath, rootDir);
    let raw: string;
    try {
      raw = readFileSync(absolutePath, 'utf8');
    } catch (error) {
      throw new Error(
        `Missing solution file: "${file.sourcePath}" (${absolutePath})`,
        { cause: error },
      );
    }

    return {
      filename: file.filename,
      lang: file.lang,
      code: raw.replace(/\r\n/g, '\n').trimEnd(),
    };
  });
}
