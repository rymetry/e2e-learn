// 第 06 章「自分の言葉で書き直す」の解答例。自分で書いてから見ること。
import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

test('the agent upgrades the plan', { session: 'alice', tags: ['agent'] }, async ({ app, agent, screen }) => {
  await app.open('/settings/billing');
  await expect(screen.getByRole('status')).toHaveText('Current plan: Free');
  // 確認ダイアログを通るのは「途中の手順」。結果は「Pro になる」の 1 つなので 1 ゴール。
  await agent.act('upgrade the workspace to the Pro plan');
  await expect(screen.getByRole('status')).toContainText('Pro');
  // 「あること」はモデルに判定させてよい
  await agent.assert('the current plan shown on the page is Pro');
  // 「無いこと」は expect で確かめる。agent.assert に「ボタンが無い」と聞くと INCONCLUSIVE になりやすい
  await expect(screen.getByRole('button', 'Upgrade to Pro')).toBeHidden();
});
