import { describe, expect, it } from 'vitest';
import {
  calculateProgress,
  filterChapters,
  formatModelRequirement,
  getAdjacentChapters,
  getChapterUrl,
  getResumeChapter,
  type ModelRequirement,
  sortChapters,
} from './chapter-utils';

describe('sortChapters', () => {
  it('sorts chapters ascending by order without mutating input', () => {
    const input = [
      { slug: '03-expect', order: 30 },
      { slug: '01-setup', order: 10 },
      { slug: '02-locators', order: 20 },
    ];
    const snapshot = [...input];

    const result = sortChapters(input);

    expect(result).toEqual([
      { slug: '01-setup', order: 10 },
      { slug: '02-locators', order: 20 },
      { slug: '03-expect', order: 30 },
    ]);
    expect(input).toEqual(snapshot);
    expect(result).not.toBe(input);
  });

  it('returns an empty array for empty input', () => {
    expect(sortChapters([])).toEqual([]);
  });
});

describe('getAdjacentChapters', () => {
  const chapters = [
    { slug: '03-expect', order: 3 },
    { slug: '01-setup', order: 1 },
    { slug: '02-locators', order: 2 },
  ];

  it('returns null prev and next chapter for the first chapter in order', () => {
    expect(getAdjacentChapters(chapters, '01-setup')).toEqual({
      prev: null,
      next: { slug: '02-locators', order: 2 },
    });
  });

  it('returns both prev and next chapters for a middle chapter', () => {
    expect(getAdjacentChapters(chapters, '02-locators')).toEqual({
      prev: { slug: '01-setup', order: 1 },
      next: { slug: '03-expect', order: 3 },
    });
  });

  it('returns prev chapter and null next for the last chapter in order', () => {
    expect(getAdjacentChapters(chapters, '03-expect')).toEqual({
      prev: { slug: '02-locators', order: 2 },
      next: null,
    });
  });

  it('returns null for both prev and next when slug is not found', () => {
    expect(getAdjacentChapters(chapters, 'missing-slug')).toEqual({
      prev: null,
      next: null,
    });
  });
});

describe('filterChapters', () => {
  const chapters = [
    { slug: '01-setup', modelRequirement: 'none' as const },
    { slug: '06-agent', modelRequirement: 'required' as const },
    { slug: '07-cache', modelRequirement: 'partial' as const },
    { slug: '12-ci', modelRequirement: 'optional' as const },
  ];
  const completed = new Set(['01-setup', '07-cache']);

  it('returns a copy of all chapters when filter is all', () => {
    const result = filterChapters(chapters, 'all', completed);
    expect(result).toEqual(chapters);
    expect(result).not.toBe(chapters);
  });

  it('returns only chapters with none requirement when filter is no-model', () => {
    expect(filterChapters(chapters, 'no-model', completed)).toEqual([
      { slug: '01-setup', modelRequirement: 'none' },
    ]);
  });

  it('returns partial, optional, and required chapters when filter is uses-model', () => {
    expect(filterChapters(chapters, 'uses-model', completed)).toEqual([
      { slug: '06-agent', modelRequirement: 'required' },
      { slug: '07-cache', modelRequirement: 'partial' },
      { slug: '12-ci', modelRequirement: 'optional' },
    ]);
  });

  it('returns only uncompleted chapters when filter is incomplete', () => {
    expect(filterChapters(chapters, 'incomplete', completed)).toEqual([
      { slug: '06-agent', modelRequirement: 'required' },
      { slug: '12-ci', modelRequirement: 'optional' },
    ]);
  });
});

describe('getChapterUrl', () => {
  it('formats chapter slug with leading and trailing slashes', () => {
    expect(getChapterUrl('01-setup-and-first-run')).toBe(
      '/chapters/01-setup-and-first-run/',
    );
  });
});

describe('formatModelRequirement', () => {
  it.each<[ModelRequirement, string]>([
    ['none', 'モデル不要'],
    ['partial', '一部モデル使用'],
    ['optional', 'モデル任意'],
    ['required', 'モデル必要'],
  ])('formats %s as %s', (requirement, expected) => {
    expect(formatModelRequirement(requirement)).toBe(expected);
  });
});

describe('calculateProgress', () => {
  it('returns zero counts and percent when totalSlugs is empty', () => {
    expect(calculateProgress([], new Set(['01-setup']))).toEqual({
      completed: 0,
      total: 0,
      percent: 0,
    });
  });

  it('counts only completed slugs present in totalSlugs and rounds percent', () => {
    const allSlugs = ['01-setup', '02-locators', '03-expect'];

    expect(calculateProgress(allSlugs, new Set())).toEqual({
      completed: 0,
      total: 3,
      percent: 0,
    });
    expect(
      calculateProgress(allSlugs, new Set(['01-setup', 'unknown-slug'])),
    ).toEqual({
      completed: 1,
      total: 3,
      percent: 33,
    });
    expect(
      calculateProgress(allSlugs, new Set(['01-setup', '03-expect'])),
    ).toEqual({
      completed: 2,
      total: 3,
      percent: 67,
    });
    expect(calculateProgress(allSlugs, new Set(allSlugs))).toEqual({
      completed: 3,
      total: 3,
      percent: 100,
    });
  });
});

describe('getResumeChapter', () => {
  const chapters = [
    { slug: '03-expect', order: 3 },
    { slug: '01-setup', order: 1 },
    { slug: '02-locators', order: 2 },
  ];

  it('returns null when chapters list is empty', () => {
    expect(getResumeChapter([], new Set())).toBeNull();
  });

  it('returns the first incomplete chapter by order', () => {
    expect(getResumeChapter(chapters, new Set())).toEqual({
      slug: '01-setup',
      order: 1,
    });
    expect(
      getResumeChapter(chapters, new Set(['01-setup', '03-expect'])),
    ).toEqual({
      slug: '02-locators',
      order: 2,
    });
  });

  it('returns the first chapter in order when all chapters are completed', () => {
    expect(
      getResumeChapter(
        chapters,
        new Set(['01-setup', '02-locators', '03-expect']),
      ),
    ).toEqual({
      slug: '01-setup',
      order: 1,
    });
  });
});
