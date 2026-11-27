# アーキテクチャ

## 原則

- 完全静的生成（SSG）を基本とし、ランタイム SSR・DB・外部 API 呼び出し・認証バックエンドは持ち込まない。
- 層にする I/O は、データの持ち主・ビルド時ファイル読込・テストのしにくさに関わるものだけにする。
  - ブラウザ永続状態（`localStorage`）は `src/lib/progress-store.ts` のみに閉じ込める。
  - Astro Content Collections（`astro:content` 仮想モジュール）へのアクセスは `src/lib/chapters.ts` に閉じ込め、純粋な計算ロジックは `src/lib/chapter-utils.ts` へ分離する。
  - 模範解答（`solutions/<slug>/*`）のビルド時 raw 読込・存在検証は `src/lib/solutions.ts` に閉じ込める。
- I/O の手段（`localStorage` 直接アクセス、`getCollection`、`node:fs`）は層の外に渡さない。UI・ページからは入口のみを使う。
- 守り方は、`tsconfig.json`・`biome.json`・`mutator.config.ts` による境界分離と、テスト・レビューで担保する。
- interface と抽象化は、2 つ目の実装が必要になってから作る。
- 入れないもの（やらないこと）:
  - `@astrojs/cloudflare` による SSR ランタイム（Static Assets のみで完結させる）
  - サイト専用リポジトリ本体への `e2e` / `@e2e-dev/web` 依存（模範解答は `solutions/` に隔離して raw 読込）
  - v1 におけるブラウザ内メモ欄・Markdown エクスポート（`ChapterNotes`）

## 構成

Astro（完全 SSG）+ Tailwind CSS v4（`@tailwindcss/vite`）+ Pagefind による静的ハンズオン教材サイト。ビルド成果物 `./dist` を Cloudflare Workers Static Assets（Cloudflare Workers Builds 連携）で配信する。URL は `trailingSlash: 'always'` + `build.format: 'directory'` + `html_handling: "auto-trailing-slash"` で末尾スラッシュ有りへ統一し、プレビュー環境は `robots.txt.ts`・`<meta name="robots">`・`public/_headers` の 3 層で `noindex` 保護する。

| 役割 | 採用 | 備考 |
| --- | --- | --- |
| Runtime | Node.js 24 (`pnpm@10.8.0`) | `.node-version` に `24`、ESM（`"type": "module"`） |
| Hosting | Cloudflare Workers Static Assets | Workers Builds（本番 `wrangler deploy`、PR プレビュー `wrangler preview`、`wrangler >= 4.135.0`） |
| Framework | Astro（SSG）+ Tailwind CSS v4 + `@astrojs/mdx` | `astro-expressive-code` を `mdx()` より前に配置し `data-theme` と連動 |
| Search | Pagefind | `astro build && pagefind --site dist`、動的 `/* @vite-ignore */` import、`SolutionReveal` は `data-pagefind-ignore` |
| Data | Astro Content Collections (`src/content/chapters/*.mdx`) + `solutions/<slug>/*` + `localStorage` | 解答コードは `src/` 外に隔離し `tsconfig`/`biome`/`mutator` から除外 |
| Lint / Format | Biome + `astro check` | Biome は `.ts/.js/.mjs/.json/.css`（Tailwind v4 directives 対応）、`.astro` は `astro check` に責務分離 |
| Test | Vitest 5 + `@mizchi/mutator` | 純粋ロジック層（`src/lib/**/*.ts`、`chapters.ts` 除外）を対象に単体・変異テスト |

### 層と入口

| 層 | ディレクトリ | 入口 | 守るもの | 例外(理由) |
| --- | --- | --- | --- | --- |
| コンテンツ取得 | `src/lib/` | `src/lib/chapters.ts` | `astro:content` (`getCollection`) の呼び出しを 1 箇所に閉じ込め、ソート・フィルタ等の純粋ロジック（`src/lib/chapter-utils.ts`）を Vitest / mutator で直接テスト可能に保つ | `src/content.config.ts`（Astro がスキーマ定義の配置をルート固定で要求するため） |
| ブラウザ進捗永続化 | `src/lib/` | `src/lib/progress-store.ts` | `localStorage` の読み書き・キー名・スキーマ検証・フォールバックを 1 箇所に閉じ込める | `src/layouts/BaseLayout.astro` のテーマ FOUC 防止 `<script is:inline>`（初回描画前に同期実行する必要があるため） |
| 模範解答 raw 読込 | `src/lib/` | `src/lib/solutions.ts` | `solutions/<slug>/*` のビルド時ファイル読込・パストラバーサル防止・存在検証を 1 箇所に閉じ込める | なし |
| リリース追従 CLI | `scripts/` | `scripts/release-diff.mjs` | `gh api` による上流 `e2e-inc/e2e` の変更検知と `tracking/release.lock.json` 更新（ビルド成果物とは独立した運用スクリプト） | なし |

守り方:
- `tsconfig.json` / `biome.json` / `mutator.config.ts` で `solutions/**` を除外し、`mutator.config.ts` で `src/lib/chapters.ts`（`astro:content` 依存）を除外する。
- `biome check .` と `astro check` を CI の必須チェック `check` で毎回実行する。
- 静的 lint で捕まえにくい「コンポーネント側からの `localStorage` 直呼び出し」や「`src/lib/chapter-utils.ts` への `astro:*` import 混入」は、Vitest 実行失敗および PR レビューで確認する。

## 後で決めること

- **ブラウザ内メモ欄・Markdown エクスポート（旧案 `ChapterNotes`）**: ハンズオン読者は手元エディタ／端末で作業するため v1 では見送り。学習者から明確な要望が出た段階で、保存容量・XSS エスケープ・エクスポート仕様と合わせて再検討する。
- **Content-Security-Policy (CSP) ヘッダ**: Pagefind の WASM（`'wasm-unsafe-eval'` / `worker-src 'self' blob:`）、テーマ FOUC 防止インラインスクリプト、Google Fonts（`fonts.googleapis.com` / `fonts.gstatic.com`）との整合テストが必要なため v1 は `X-Content-Type-Options` / `Referrer-Policy` / `X-Frame-Options` / `Permissions-Policy` に留め、本番運用後に Report-Only から段階導入を検討する。
- **独自ドメインへの移行**: 将来サブドメインへ移行する際は、Workers Builds の `SITE_URL` 更新、`wrangler.jsonc` への `routes`（`custom_domain: true`）追加、`workers_dev: false`（またはリダイレクト）で対応する。
- **Part 2（モバイル Expo 第 15〜17 章）の公開**: v1 では `/curriculum/` 末尾に準備中として予告のみ表示し、`@e2e-dev/mobile` の追従と執筆準備が整った段階で追加する。

## 判断の記録

- 2026-11-27(rymetry): Astro SSG + Tailwind CSS v4 + Pagefind + Cloudflare Workers Static Assets でサイト専用リポジトリ `rymetry/e2e-learn` を構築し、模範解答は `solutions/` へ隔離、純粋ロジックは `src/lib/` で I/O アダプタ（`chapters.ts` / `progress-store.ts` / `solutions.ts`）と分離する構成を採用した。理由: SSR 不要の高速配信、PR プレビューの自動化、`e2e` 依存なしの型安全なビルド、Vitest 5 / mutator との安定したテスト両立のため。退けた案: 既存教材リポジトリ同居型（ビルド・依存分離が複雑）、`@astrojs/cloudflare` SSR（不要なランタイム負荷）、`ChapterNotes` の v1 同梱（過剰機能）。元: `docs/plans/2026-11-27-e2e-learn-site.md`
