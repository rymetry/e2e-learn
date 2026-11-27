import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { loadSolutionFiles, resolveSolutionPath } from './solutions';

const createdDirs: string[] = [];

function createTempRoot(): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'e2e-learn-solutions-'));
  createdDirs.push(dir);
  mkdirSync(path.join(dir, 'solutions'), { recursive: true });
  return dir;
}

afterEach(() => {
  while (createdDirs.length > 0) {
    const dir = createdDirs.pop();
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe('resolveSolutionPath', () => {
  it('resolves valid relative paths inside rootDir/solutions/', () => {
    const rootDir = createTempRoot();
    const resolved = resolveSolutionPath(
      '01-setup-and-first-run/example.e2e.ts',
      rootDir,
    );

    expect(resolved).toBe(
      path.join(
        rootDir,
        'solutions',
        '01-setup-and-first-run',
        'example.e2e.ts',
      ),
    );
  });

  it('defaults rootDir to process.cwd()', () => {
    expect(resolveSolutionPath('02-locators/sample.e2e.ts')).toBe(
      path.join(process.cwd(), 'solutions', '02-locators', 'sample.e2e.ts'),
    );
  });

  it('rejects empty or whitespace-only paths', () => {
    const rootDir = createTempRoot();

    expect(() => resolveSolutionPath('', rootDir)).toThrow(
      'Invalid solution path',
    );
    expect(() => resolveSolutionPath('   ', rootDir)).toThrow(
      'Invalid solution path',
    );
  });

  it('rejects absolute paths even when pointing inside solutions/', () => {
    const rootDir = createTempRoot();
    const absoluteInside = path.join(rootDir, 'solutions', '01', 'test.ts');

    expect(() => resolveSolutionPath('/etc/passwd', rootDir)).toThrow(
      'Invalid solution path',
    );
    expect(() => resolveSolutionPath(absoluteInside, rootDir)).toThrow(
      'Invalid solution path',
    );
  });

  it('rejects paths escaping solutions/ via parent traversal, dot, or sibling prefix', () => {
    const rootDir = createTempRoot();

    for (const badPath of [
      '.',
      '../package.json',
      '01-setup/../../package.json',
      '../solutions-evil/leak.ts',
    ]) {
      expect(() => resolveSolutionPath(badPath, rootDir)).toThrow(
        'escapes solutions/',
      );
    }
  });
});

describe('loadSolutionFiles', () => {
  it('loads UTF-8 solution files, normalizes CRLF, and trims trailing blank lines while keeping indentation', () => {
    const rootDir = createTempRoot();
    const chapterDir = path.join(rootDir, 'solutions', '01-setup');
    mkdirSync(chapterDir, { recursive: true });
    writeFileSync(
      path.join(chapterDir, 'first.e2e.ts'),
      '  const a = 1;\r\n  const b = 2;\r\n  const c = 3;\r\n\r\n',
      'utf8',
    );
    writeFileSync(
      path.join(chapterDir, 'config.ts'),
      'export default {};\n\n  \n',
      'utf8',
    );

    const loaded = loadSolutionFiles(
      [
        {
          filename: 'tests/01-setup/first.e2e.ts',
          lang: 'ts',
          sourcePath: '01-setup/first.e2e.ts',
        },
        {
          filename: 'e2e.config.ts',
          lang: 'ts',
          sourcePath: '01-setup/config.ts',
        },
      ],
      rootDir,
    );

    expect(loaded).toEqual([
      {
        filename: 'tests/01-setup/first.e2e.ts',
        lang: 'ts',
        code: '  const a = 1;\n  const b = 2;\n  const c = 3;',
      },
      {
        filename: 'e2e.config.ts',
        lang: 'ts',
        code: 'export default {};',
      },
    ]);
  });

  it('returns an empty array when files list is empty', () => {
    const rootDir = createTempRoot();
    expect(loadSolutionFiles([], rootDir)).toEqual([]);
  });

  it('throws a clear error naming the missing file with original cause when absent', () => {
    const rootDir = createTempRoot();

    let thrown: unknown;
    try {
      loadSolutionFiles(
        [
          {
            filename: 'missing.e2e.ts',
            lang: 'ts',
            sourcePath: '01-setup/missing.e2e.ts',
          },
        ],
        rootDir,
      );
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).message).toContain(
      'Missing solution file: "01-setup/missing.e2e.ts"',
    );
    expect((thrown as Error).cause).toMatchObject({ code: 'ENOENT' });
  });

  it('rejects escaping paths without reading outside solutions/', () => {
    const rootDir = createTempRoot();
    writeFileSync(path.join(rootDir, 'secret.txt'), 'top-secret', 'utf8');

    expect(() =>
      loadSolutionFiles(
        [
          {
            filename: 'secret.txt',
            lang: 'txt',
            sourcePath: '../secret.txt',
          },
        ],
        rootDir,
      ),
    ).toThrow('escapes solutions/');
  });
});
