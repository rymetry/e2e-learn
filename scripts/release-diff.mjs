#!/usr/bin/env node
// e2e-inc/e2e の新しいリリースを、教材が前提にしている版（tracking/release.lock.json）と比べる。
//
//   pnpm release:diff                              lock 以降のリリースを Markdown で出す（無ければ NO_NEW_RELEASES）
//   pnpm release:diff -- --update e2e@0.26.0       lock のそのパッケージを進める
//   pnpm release:diff -- --max-chars 60000         超える分のリリースノートを古い順に省略する（Issue 本文の上限対策）
//
// 各リリースについて、リリースノート（changeset 由来、PR ごとの変更点）と、
// 直前タグとの compare から docs/ の変更ファイル → tracking/docs-map.json で影響する章・ページを表にする。
// gh CLI（認証済み）が必要。

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const REPO = 'e2e-inc/e2e';
const LOCK_PATH = new URL('../tracking/release.lock.json', import.meta.url);
const MAP_PATH = new URL('../tracking/docs-map.json', import.meta.url);
const PACKAGES = ['e2e', '@e2e-dev/web', '@e2e-dev/mobile'];
const COMPARE_FILE_LIMIT = 300;
// 多言語翻訳ディレクトリと画像アセットは英語原本 docs の変更検知ノイズになるため除外する
const IGNORED_DOCS_RE = /^docs\/(cs|es|fr|hi|ja|pl|pt|zh|images)\//;

const lock = JSON.parse(readFileSync(LOCK_PATH, 'utf8'));
const mapJson = JSON.parse(readFileSync(MAP_PATH, 'utf8'));
const chapterMap = mapJson.chapters ?? {};
const pageMap = mapJson.pages ?? {};

const args = process.argv.slice(2);
const updateIndex = args.indexOf('--update');
if (updateIndex !== -1) {
  const tag = args[updateIndex + 1];
  const pkg = PACKAGES.find((name) => tag?.startsWith(`${name}@`));
  if (!pkg) {
    console.error(
      `--update には ${PACKAGES.map((p) => `${p}@x.y.z`).join(' / ')} の形のタグを渡してください`,
    );
    process.exit(2);
  }
  lock[pkg] = tag;
  writeFileSync(LOCK_PATH, `${JSON.stringify(lock, null, 2)}\n`);
  console.log(`${pkg} を ${tag} に更新しました`);
  process.exit(0);
}

const maxCharsIndex = args.indexOf('--max-chars');
const maxChars =
  maxCharsIndex === -1
    ? Number.POSITIVE_INFINITY
    : Number(args[maxCharsIndex + 1]);
if (!(maxChars > 0)) {
  console.error('--max-chars には正の数を渡してください');
  process.exit(2);
}

function gh(path) {
  return JSON.parse(
    execFileSync('gh', ['api', path], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    }),
  );
}

function version(tag) {
  return tag.slice(tag.lastIndexOf('@') + 1);
}

function compareVersions(a, b) {
  const pa = version(a).split('.').map(Number);
  const pb = version(b).split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

function isTrackedDocFile(filename) {
  return filename.startsWith('docs/') && !IGNORED_DOCS_RE.test(filename);
}

function targetsFor(file) {
  const chapters = Object.entries(chapterMap)
    .filter(([, files]) => files.includes(file))
    .map(([chapter]) => chapter);
  const pages = Object.entries(pageMap)
    .filter(([, files]) => files.includes(file))
    .map(([page]) => `/${page}/`);
  return [...chapters, ...pages];
}

const releases = gh(`repos/${REPO}/releases?per_page=100`);
const sections = [];

for (const pkg of PACKAGES) {
  const locked = lock[pkg];
  if (!locked) continue;
  const newer = releases
    .filter(
      (r) =>
        r.tag_name.startsWith(`${pkg}@`) &&
        compareVersions(r.tag_name, locked) > 0,
    )
    .sort((a, b) => compareVersions(a.tag_name, b.tag_name));
  if (newer.length === 0) continue;

  let prevTag = locked;
  for (const release of newer) {
    const head = [
      `## ${release.tag_name}（${release.published_at.slice(0, 10)}）`,
      '',
      release.html_url,
      '',
    ];
    const notes = release.body?.trim() || '（本文なし）';
    const lines = [];

    if (pkg === 'e2e') {
      const compare = gh(
        `repos/${REPO}/compare/${prevTag}...${release.tag_name}`,
      );
      const allFiles = compare.files ?? [];
      const hitLimit = allFiles.length >= COMPARE_FILE_LIMIT;
      const docs = allFiles.filter((f) => isTrackedDocFile(f.filename));

      lines.push(`### docs の差分（${prevTag} → ${release.tag_name}）`, '');
      if (hitLimit) {
        lines.push(
          `> [!WARNING]`,
          `> GitHub Compare API の ${COMPARE_FILE_LIMIT} ファイル上限に達しました（返却件数: ${allFiles.length}）。\`docs/reference/*.mdx\` 等の変更が切り落とされている可能性があるため、手動で比較リンクを確認してください。`,
          '',
        );
      }

      if (docs.length === 0) {
        lines.push('英語原本 docs/ に変更はありません。', '');
      } else {
        lines.push(
          '| 変更 | ファイル | 影響する章・ページ |',
          '| --- | --- | --- |',
        );
        for (const f of docs) {
          const targets = targetsFor(f.filename);
          lines.push(
            `| ${f.status} +${f.additions} -${f.deletions} | \`${f.filename}\` | ${targets.length ? targets.join(', ') : '（対応表に無し）'} |`,
          );
        }
        lines.push('');
      }
      prevTag = release.tag_name;
    }

    sections.push({
      publishedAt: release.published_at,
      head,
      notes,
      docs: lines,
      notesOmitted: false,
    });
  }
}

function renderSection({ head, notes, docs, notesOmitted }) {
  const body = notesOmitted
    ? '（文字数の上限を超えるため省略。全文は上のリンクを参照）'
    : notes;
  return [...head, '### リリースノート', '', body, '', ...docs].join('\n');
}

function renderReport() {
  const locked = PACKAGES.filter((p) => lock[p])
    .map((p) => `\`${lock[p]}\``)
    .join(', ');
  return `# 新しいリリース\n\n前提: ${locked}\n\n${sections.map(renderSection).join('\n---\n\n')}`;
}

if (sections.length === 0) {
  console.log('NO_NEW_RELEASES');
} else {
  const oldestFirst = [...sections].sort((a, b) =>
    a.publishedAt.localeCompare(b.publishedAt),
  );
  for (const section of oldestFirst) {
    if (renderReport().length <= maxChars) break;
    section.notesOmitted = true;
  }
  console.log(renderReport());
}
