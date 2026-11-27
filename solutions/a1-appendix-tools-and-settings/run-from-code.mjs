// 付録 A「一緒に書く」の runner API サンプル（scripts/run-from-code.mjs）。
// 実行: node scripts/run-from-code.mjs（Node.js が必要。Bun では NODE_UNSUPPORTED になる）
import { list, run } from 'e2e/runner';

// 1. 実行せずに選択だけ見る（e2e list と同じ）
const selection = await list({ tags: ['agent'] });
const selected = selection.pairs.filter((pair) => pair.disposition === 'run');
console.log(`agent タグのテスト: ${selected.length} 件（収集 ${selection.pairs.length} 件）`);

// 2. 1 ファイルだけ実行し、report を受け取る
const result = await run({
  files: ['tests/04-test-structure/fixtures.e2e.ts'],
  onEvent(event) {
    if (event.type === 'test-started') console.log(`  started  ${event.title}`);
  },
});
console.log(result.status, JSON.stringify(result.report.run.summary));
process.exitCode = result.exitCode;
