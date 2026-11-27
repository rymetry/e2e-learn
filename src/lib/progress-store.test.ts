import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  loadProgress,
  PROGRESS_STORAGE_KEY,
  type ProgressState,
  parseProgress,
  resetProgress,
  saveProgress,
  serializeProgress,
  toggleChapterCompletion,
} from './progress-store';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PROGRESS_STORAGE_KEY', () => {
  it('uses the versioned storage key', () => {
    expect(PROGRESS_STORAGE_KEY).toBe('e2e-learn:progress:v1');
  });
});

describe('parseProgress', () => {
  it('returns empty progress for null, empty, or malformed JSON', () => {
    for (const raw of [
      null,
      '',
      '   ',
      '{not-json',
      'null',
      '[]',
      '123',
      '"text"',
      '{"updatedAt":"2026-11-27T00:00:00.000Z"}',
      '{"completed":"01-setup"}',
    ]) {
      expect(parseProgress(raw)).toEqual({ completed: [], updatedAt: '' });
    }
  });

  it('deduplicates trimmed non-empty string slugs and validates updatedAt', () => {
    const raw = JSON.stringify({
      completed: [
        '01-setup',
        ' 02-locators ',
        '',
        '   ',
        42,
        null,
        '01-setup',
        '02-locators',
      ],
      updatedAt: '2026-11-27T04:00:00.000Z',
    });

    expect(parseProgress(raw)).toEqual({
      completed: ['01-setup', '02-locators'],
      updatedAt: '2026-11-27T04:00:00.000Z',
    });
  });

  it('falls back to empty string when updatedAt is not a string', () => {
    const raw = JSON.stringify({
      completed: ['01-setup'],
      updatedAt: 12345,
    });

    expect(parseProgress(raw)).toEqual({
      completed: ['01-setup'],
      updatedAt: '',
    });
  });
});

describe('serializeProgress', () => {
  it('serializes state to JSON that round-trips via parseProgress', () => {
    const state: ProgressState = {
      completed: ['01-setup', '02-locators'],
      updatedAt: '2026-11-27T04:30:00.000Z',
    };

    const json = serializeProgress(state);
    expect(json).toBe(
      '{"completed":["01-setup","02-locators"],"updatedAt":"2026-11-27T04:30:00.000Z"}',
    );
    expect(parseProgress(json)).toEqual(state);
  });
});

describe('toggleChapterCompletion', () => {
  it('adds an incomplete slug without mutating input state', () => {
    const initial: ProgressState = {
      completed: ['01-setup'],
      updatedAt: '2026-11-27T01:00:00.000Z',
    };

    const next = toggleChapterCompletion(
      initial,
      '02-locators',
      '2026-11-27T02:00:00.000Z',
    );

    expect(next).toEqual({
      completed: ['01-setup', '02-locators'],
      updatedAt: '2026-11-27T02:00:00.000Z',
    });
    expect(initial.completed).toEqual(['01-setup']);
  });

  it('removes an already completed slug without mutating input state', () => {
    const initial: ProgressState = {
      completed: ['01-setup', '02-locators'],
      updatedAt: '2026-11-27T01:00:00.000Z',
    };

    const next = toggleChapterCompletion(
      initial,
      '01-setup',
      '2026-11-27T03:00:00.000Z',
    );

    expect(next).toEqual({
      completed: ['02-locators'],
      updatedAt: '2026-11-27T03:00:00.000Z',
    });
    expect(initial.completed).toEqual(['01-setup', '02-locators']);
  });

  it('generates an ISO timestamp when nowIso is omitted', () => {
    const next = toggleChapterCompletion(
      { completed: [], updatedAt: '' },
      '01-setup',
    );

    expect(next.completed).toEqual(['01-setup']);
    expect(Number.isNaN(Date.parse(next.updatedAt))).toBe(false);
  });
});

describe('storage operations', () => {
  function createMemoryStorage() {
    const store = new Map<string, string>();
    return {
      store,
      getItem: vi.fn((key: string) => store.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store.set(key, value);
      }),
      removeItem: vi.fn((key: string) => {
        store.delete(key);
      }),
    };
  }

  it('saves, loads, and resets progress using PROGRESS_STORAGE_KEY', () => {
    const storage = createMemoryStorage();
    const state: ProgressState = {
      completed: ['01-setup', '03-expect'],
      updatedAt: '2026-11-27T05:00:00.000Z',
    };

    saveProgress(state, storage);
    expect(storage.setItem).toHaveBeenCalledWith(
      PROGRESS_STORAGE_KEY,
      serializeProgress(state),
    );

    expect(loadProgress(storage)).toEqual(state);
    expect(storage.getItem).toHaveBeenCalledWith(PROGRESS_STORAGE_KEY);

    resetProgress(storage);
    expect(storage.removeItem).toHaveBeenCalledWith(PROGRESS_STORAGE_KEY);
    expect(loadProgress(storage)).toEqual({ completed: [], updatedAt: '' });
  });

  it('handles storage exceptions safely without throwing', () => {
    const brokenStorage = {
      getItem: vi.fn(() => {
        throw new Error('SecurityError');
      }),
      setItem: vi.fn(() => {
        throw new Error('QuotaExceededError');
      }),
      removeItem: vi.fn(() => {
        throw new Error('SecurityError');
      }),
    };

    expect(loadProgress(brokenStorage)).toEqual({
      completed: [],
      updatedAt: '',
    });
    expect(() =>
      saveProgress({ completed: ['01-setup'], updatedAt: '' }, brokenStorage),
    ).not.toThrow();
    expect(() => resetProgress(brokenStorage)).not.toThrow();
  });

  it('uses globalThis.localStorage when storage argument is omitted', () => {
    const storage = createMemoryStorage();
    vi.stubGlobal('localStorage', storage);

    const state: ProgressState = {
      completed: ['06-agent-steps'],
      updatedAt: '2026-11-27T06:00:00.000Z',
    };
    saveProgress(state);
    expect(loadProgress()).toEqual(state);

    resetProgress();
    expect(loadProgress()).toEqual({ completed: [], updatedAt: '' });
  });

  it('falls back safely when globalThis.localStorage is undefined', () => {
    vi.stubGlobal('localStorage', undefined);

    expect(loadProgress()).toEqual({ completed: [], updatedAt: '' });
    expect(() =>
      saveProgress({ completed: ['01-setup'], updatedAt: '' }),
    ).not.toThrow();
    expect(() => resetProgress()).not.toThrow();
  });

  it('falls back safely when accessing globalThis.localStorage throws', () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'localStorage',
    );
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('blocked');
      },
    });

    try {
      expect(loadProgress()).toEqual({ completed: [], updatedAt: '' });
      expect(() =>
        saveProgress({ completed: ['01-setup'], updatedAt: '' }),
      ).not.toThrow();
      expect(() => resetProgress()).not.toThrow();
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(globalThis, 'localStorage', originalDescriptor);
      } else {
        Reflect.deleteProperty(globalThis, 'localStorage');
      }
    }
  });
});
