import { type CollectionEntry, getCollection } from 'astro:content';
import { type ChapterMeta, sortChapters } from './chapter-utils';

export function toChapterMeta(entry: CollectionEntry<'chapters'>): ChapterMeta {
  return {
    slug: entry.id,
    ...entry.data,
  };
}

export async function getAllChapters(): Promise<CollectionEntry<'chapters'>[]> {
  const entries: CollectionEntry<'chapters'>[] =
    await getCollection('chapters');
  const ordered: { order: number; entry: CollectionEntry<'chapters'> }[] =
    entries.map((entry) => ({ order: entry.data.order, entry }));
  return sortChapters(ordered).map(({ entry }) => entry);
}
