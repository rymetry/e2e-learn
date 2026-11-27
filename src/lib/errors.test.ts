import { describe, expect, it } from 'vitest';
import {
  ERROR_ENTRIES,
  type ErrorCategory,
  type ErrorEntry,
  filterErrorEntries,
} from './errors';

const VALID_CHAPTER_SLUGS = new Set([
  '01-setup-and-first-run',
  '02-locators',
  '03-expect',
  '04-test-structure',
  '06-agent-steps',
  '07-replay-cache',
  '08-debugging',
  '09-authentication',
  '10-api-testing',
  '11-page-objects-and-visual',
  '12-ci-and-reporters',
]);

describe('ERROR_ENTRIES', () => {
  it('contains unique e2e@0.25.0 error codes covering all categories', () => {
    expect(ERROR_ENTRIES.length).toBeGreaterThan(20);

    const codes = ERROR_ENTRIES.map((entry) => entry.code);
    expect(new Set(codes).size).toBe(codes.length);

    const categories = new Set(ERROR_ENTRIES.map((entry) => entry.category));
    expect(categories).toEqual(
      new Set<ErrorCategory>([
        'setup',
        'locator',
        'agent',
        'runtime',
        'config',
      ]),
    );

    for (const requiredCode of [
      'NO_TESTS',
      'APP_UNREACHABLE',
      'INVALID_CONFIG',
      'COLLECTION_ERROR',
      'NODE_UNSUPPORTED',
      'INVALID_LOCATOR',
      'LOCATOR_AMBIGUOUS',
      'LOCATOR_NOT_FOUND',
      'ASSERTION_FAILED',
      'STEP_NOT_AWAITED',
      'MODEL_UNAVAILABLE',
      'MODEL_PROVIDER_FAILED',
      'MODEL_REFUSED',
      'ACTION_FAILED',
      'ASSERTION_INCONCLUSIVE',
      'STEP_BUDGET_EXHAUSTED',
      'STEP_TIMEOUT',
      'REPLAY_STALE',
      'CANCELLED',
      'TYPESCRIPT_COMPILER_UNAVAILABLE',
      'IMAGE_CODEC_UNAVAILABLE',
    ]) {
      expect(codes).toContain(requiredCode);
    }
  });

  it('uses valid chapter slugs, non-empty fields, and no em-dashes or spaced en-dashes', () => {
    expect(ERROR_ENTRIES.length).toBeGreaterThan(0);

    for (const entry of ERROR_ENTRIES) {
      expect(VALID_CHAPTER_SLUGS.has(entry.chapterSlug)).toBe(true);
      for (const value of [
        entry.code,
        entry.symptom,
        entry.cause,
        entry.fix,
        entry.chapterSlug,
        entry.chapterLabel,
      ]) {
        expect(value.trim().length).toBeGreaterThan(0);
        expect(value).not.toContain('\u2014');
        expect(value).not.toContain(' \u2013 ');
      }
    }
  });
});

describe('filterErrorEntries', () => {
  const sampleEntries: readonly ErrorEntry[] = [
    {
      code: 'ALPHA_CODE',
      category: 'setup',
      symptom: 'SymptomAlpha text',
      cause: 'CauseAlpha reason',
      fix: 'FixAlpha remedy',
      chapterSlug: '01-setup-and-first-run',
      chapterLabel: 'Ch 1',
    },
    {
      code: 'BETA_CODE',
      category: 'locator',
      symptom: 'SymptomBeta text',
      cause: 'CauseBeta reason',
      fix: 'FixBeta remedy',
      chapterSlug: '02-locators',
      chapterLabel: 'Ch 2',
    },
    {
      code: 'GAMMA_CODE',
      category: 'agent',
      symptom: 'SymptomGamma text',
      cause: 'CauseGamma reason',
      fix: 'FixGamma remedy',
      chapterSlug: '06-agent-steps',
      chapterLabel: 'Ch 6',
    },
  ];

  it('returns all entries when query is blank and category is all', () => {
    expect(filterErrorEntries(sampleEntries, '', 'all')).toEqual(sampleEntries);
    expect(filterErrorEntries(sampleEntries, '   ', 'all')).toEqual(
      sampleEntries,
    );
  });

  it('filters strictly by category when query is empty', () => {
    expect(filterErrorEntries(sampleEntries, '', 'locator')).toEqual([
      sampleEntries[1],
    ]);
  });

  it('matches case-insensitively and trims query across code, symptom, cause, and fix', () => {
    expect(filterErrorEntries(sampleEntries, '  alpha_code  ', 'all')).toEqual([
      sampleEntries[0],
    ]);
    expect(filterErrorEntries(sampleEntries, 'SYMPTOMBETA', 'all')).toEqual([
      sampleEntries[1],
    ]);
    expect(filterErrorEntries(sampleEntries, 'causegamma', 'all')).toEqual([
      sampleEntries[2],
    ]);
    expect(filterErrorEntries(sampleEntries, 'FIXBETA', 'all')).toEqual([
      sampleEntries[1],
    ]);
  });

  it('applies category and query together', () => {
    expect(filterErrorEntries(sampleEntries, 'alpha', 'setup')).toEqual([
      sampleEntries[0],
    ]);
    expect(filterErrorEntries(sampleEntries, 'alpha', 'locator')).toEqual([]);
    expect(filterErrorEntries(sampleEntries, 'nonexistent', 'all')).toEqual([]);
  });
});
