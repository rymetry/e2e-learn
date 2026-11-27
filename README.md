# e2e Zero to Hero

**e2e inc.** が提供するエージェント型 E2E テストフレームワーク `e2e` をゼロから実務レベルまで学べる日本語ハンズオンサイト（`rymetry/e2e-learn`）。

- **対象バージョン**: `e2e@0.25.0` / `@e2e-dev/web@0.17.0` / `@e2e-dev/github@0.4.7`
- **練習用アプリ**: 公開練習用アプリ（`https://test-automation-practice-app.rymetry.workers.dev`）に対して手元からすぐテストを実行可能
- **構成**: Part 1（第 00〜14 章）+ 付録 A、セットアップガイド、エラーコード逆引き、クイックリファレンス

## 技術スタック

- **Framework**: Astro（SSG）+ `@astrojs/mdx` + `astro-expressive-code` + `@astrojs/sitemap`
- **Styling**: Tailwind CSS v4（`@tailwindcss/vite`）
- **Search**: Pagefind（静的日本語全文検索）
- **Hosting**: Cloudflare Workers Static Assets（Cloudflare Workers Builds）
- **Quality**: TypeScript (`strict`), Biome, `astro check`, Vitest 5, `@mizchi/mutator`

## 開発コマンド

前提: Node.js 24（`.node-version` 参照）、`pnpm@10.8.0`

```bash
# 依存のインストール
pnpm install

# ローカル開発サーバー
pnpm dev

# プロダクションビルド + Pagefind 検索インデックス生成
pnpm build

# Cloudflare Workers ローカルプレビュー（workerd）
pnpm preview

# 型チェック・Astro 検証・Biome リント
pnpm check

# 単体テスト（Vitest 5）
pnpm test

# 変異テスト（origin/main との差分）
pnpm mutate

# 上流 e2e-inc/e2e の新リリースと影響章・ページを確認（gh CLI 必須）
pnpm release:diff
```

## ディレクトリ構成

```text
src/
  content.config.ts       # Astro Content Collections（chapters スキーマ）
  content/chapters/       # 全 16 章の MDX 本文（00〜14 + a1）
  data/                   # エラーコード辞書等の構造化データ
  lib/                    # 純粋ロジックと I/O 境界アダプタ（chapters / progress-store / solutions）
  layouts/                # BaseLayout / ChapterLayout
  components/             # Header / Footer / HeroStage / SolutionReveal / SearchModal 等
  pages/                  # /, /curriculum/, /setup/, /chapters/[slug]/, /errors/, /reference/ 等
  styles/                 # Tailwind CSS v4 デザイントークン（Precision Lab）
  assets/                 # 最適化対象の画像アセット（OGP・スクリーンショット）
solutions/                # 各章の模範解答コード（src/ 外・ビルド時 raw 読込）
tracking/                 # 上流 e2e リリース追従（release.lock.json / docs-map.json）
scripts/                  # release-diff.mjs（リリース差分レポート生成）
public/                   # _headers 等、静的コピーアセット
docs/                     # アーキテクチャ正本（overview.md）と設計プラン
```

## デプロイ（Cloudflare Workers Builds）

- **Build command**: `pnpm build`
- **Deploy command（本番 `main`）**: `pnpm exec wrangler deploy`
- **Non-production branch deploy command（PR プレビュー）**: `pnpm exec wrangler preview`
- **Build variable**: `SITE_URL`（本番 URL を指定。未設定時は `https://e2e-learn.rymetry.workers.dev`）

PR プレビュー環境は `WORKERS_CI` / `WORKERS_CI_BRANCH` および `public/_headers` の 3 層で `noindex` 保護されます。

## リリース追従

週次ワークフロー（`.github/workflows/release-watch.yml`）または手元の `pnpm release:diff` で `e2e-inc/e2e` の新リリースと影響する章・ページを確認できます。対応が完了したらロックファイルを更新します。

```bash
pnpm release:diff -- --update e2e@0.26.0
```

## ライセンス

[MIT License](./LICENSE)
