export type ModelRequirement = 'none' | 'partial' | 'optional' | 'required';

export type ChapterPart = 'part-1' | 'appendix';

export interface SolutionFileRef {
  filename: string;
  lang: string;
  sourcePath: string;
}

export interface ChapterMeta {
  slug: string;
  chapterNumber: string;
  order: number;
  part: ChapterPart;
  title: string;
  summary: string;
  modelRequirement: ModelRequirement;
  estimatedMinutes: number;
  prerequisites: string[];
  solutionFiles: SolutionFileRef[];
  e2eVersion?: string;
  webVersion?: string;
}

export type CurriculumFilter = 'all' | 'no-model' | 'uses-model' | 'incomplete';

const MODEL_REQUIREMENT_LABELS: Record<ModelRequirement, string> = {
  none: 'モデル不要',
  partial: '一部モデル使用',
  optional: 'モデル任意',
  required: 'モデル必要',
};

export function sortChapters<T extends Pick<ChapterMeta, 'order'>>(
  chapters: readonly T[],
): T[] {
  return [...chapters].sort((a, b) => a.order - b.order);
}

export function getAdjacentChapters<
  T extends Pick<ChapterMeta, 'slug' | 'order'>,
>(
  chapters: readonly T[],
  currentSlug: string,
): { prev: T | null; next: T | null } {
  const sorted = sortChapters(chapters);
  const index = sorted.findIndex((chapter) => chapter.slug === currentSlug);
  if (index === -1) {
    return { prev: null, next: null };
  }
  return {
    prev: sorted[index - 1] ?? null,
    next: sorted[index + 1] ?? null,
  };
}

export function filterChapters<
  T extends Pick<ChapterMeta, 'slug' | 'modelRequirement'>,
>(
  chapters: readonly T[],
  filter: CurriculumFilter,
  completedSlugs: ReadonlySet<string>,
): T[] {
  switch (filter) {
    case 'all':
      return [...chapters];
    case 'no-model':
      return chapters.filter((chapter) => chapter.modelRequirement === 'none');
    case 'uses-model':
      return chapters.filter((chapter) => chapter.modelRequirement !== 'none');
    case 'incomplete':
      return chapters.filter((chapter) => !completedSlugs.has(chapter.slug));
  }
}

export function getChapterUrl(slug: string): string {
  return `/chapters/${slug}/`;
}

export function formatModelRequirement(req: ModelRequirement): string {
  return MODEL_REQUIREMENT_LABELS[req];
}

export function calculateProgress(
  totalSlugs: readonly string[],
  completedSlugs: ReadonlySet<string>,
): { completed: number; total: number; percent: number } {
  const total = totalSlugs.length;
  if (total === 0) {
    return { completed: 0, total: 0, percent: 0 };
  }
  const completed = totalSlugs.filter((slug) =>
    completedSlugs.has(slug),
  ).length;
  const percent = Math.round((completed / total) * 100);
  return { completed, total, percent };
}

export function getResumeChapter<T extends Pick<ChapterMeta, 'slug' | 'order'>>(
  chapters: readonly T[],
  completedSlugs: ReadonlySet<string>,
): T | null {
  const sorted = sortChapters(chapters);
  const first = sorted[0];
  if (!first) {
    return null;
  }
  return sorted.find((chapter) => !completedSlugs.has(chapter.slug)) ?? first;
}
