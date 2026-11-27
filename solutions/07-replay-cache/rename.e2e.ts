// 第 07 章「自分の言葉で書き直す」の解答例。テスト名や params を変えて走らせ、cache の mode を見比べる。
import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

// 1. このまま 2 回走らせる → 2 回目は self-finalized
// 2. テスト名を 'adds a todo (renamed)' に変える → missed no-entry（鍵にテスト名が入っている）
// 3. 名前を戻し、title を 'Milk' に変える → missed no-entry（鍵に params が入っている）
test('adds a todo', {
  tags: ['agent'],
  agentContext: 'After Add, the input clears first and the new todo appears in the Todos list a moment later. Observe the screen again before deciding it did not appear.',
}, async ({ app, agent, screen }) => {
  await app.open('/todos');
  const result = await agent.act('add a todo named {title}', { params: { title: 'Buy milk' } });
  console.log('cache:', result.cache?.mode, result.cache?.reason ?? '');
  await expect(screen.getByRole('checkbox', 'Buy milk')).toBeVisible();
});
