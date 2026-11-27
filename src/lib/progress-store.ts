export const PROGRESS_STORAGE_KEY = 'e2e-learn:progress:v1';

export interface ProgressState {
  completed: string[];
  updatedAt: string;
}

function createEmptyProgress(): ProgressState {
  return { completed: [], updatedAt: '' };
}

function resolveDefaultStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function parseProgress(raw: string | null): ProgressState {
  if (raw === null) {
    return createEmptyProgress();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return createEmptyProgress();
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return createEmptyProgress();
  }

  const record = parsed as Record<string, unknown>;
  if (!Array.isArray(record.completed)) {
    return createEmptyProgress();
  }

  const seen = new Set<string>();
  for (const item of record.completed) {
    if (typeof item === 'string') {
      const slug = item.trim();
      if (slug.length > 0) {
        seen.add(slug);
      }
    }
  }

  const updatedAt =
    typeof record.updatedAt === 'string' ? record.updatedAt : '';
  return {
    completed: [...seen],
    updatedAt,
  };
}

export function serializeProgress(state: ProgressState): string {
  return JSON.stringify({
    completed: state.completed,
    updatedAt: state.updatedAt,
  });
}

export function toggleChapterCompletion(
  state: ProgressState,
  slug: string,
  nowIso = new Date().toISOString(),
): ProgressState {
  const isCompleted = state.completed.includes(slug);
  const completed = isCompleted
    ? state.completed.filter((item) => item !== slug)
    : [...state.completed, slug];

  return {
    completed,
    updatedAt: nowIso,
  };
}

export function loadProgress(
  storage?: Pick<Storage, 'getItem'>,
): ProgressState {
  const target = storage ?? resolveDefaultStorage();
  if (!target) {
    return createEmptyProgress();
  }
  try {
    return parseProgress(target.getItem(PROGRESS_STORAGE_KEY));
  } catch {
    return createEmptyProgress();
  }
}

export function saveProgress(
  state: ProgressState,
  storage?: Pick<Storage, 'setItem'>,
): void {
  const target = storage ?? resolveDefaultStorage();
  if (!target) {
    return;
  }
  try {
    target.setItem(PROGRESS_STORAGE_KEY, serializeProgress(state));
  } catch {
    // プライベートモードや容量上限で書き込めない場合でも画面操作を止めない
  }
}

export function resetProgress(storage?: Pick<Storage, 'removeItem'>): void {
  const target = storage ?? resolveDefaultStorage();
  if (!target) {
    return;
  }
  try {
    target.removeItem(PROGRESS_STORAGE_KEY);
  } catch {
    // ストレージアクセスが制限された環境でも安全に終了する
  }
}
