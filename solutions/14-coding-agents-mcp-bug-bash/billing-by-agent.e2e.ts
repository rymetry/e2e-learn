// 第 14 章「自分の言葉で書き直す」の解答例。エージェントが書いたテストをレビューして直した後の形の一例。
// レビューで直した点: ログインを session に、act の直後に expect、agent タグ、「無いこと」は expect で。
import { describe, test } from '@e2e-dev/web';
import { expect } from 'e2e';

describe('billing', { session: 'alice', tags: ['agent'] }, () => {
  test('upgrades to the Pro plan', async ({ app, agent, screen }) => {
    await app.open('/settings/billing');
    await expect(screen.getByRole('status')).toHaveText('Current plan: Free');

    await agent.act('upgrade the workspace to the Pro plan');
    await expect(screen.getByRole('status')).toContainText('Pro');
    await expect(screen.getByRole('button', 'Upgrade to Pro')).toBeHidden();
  });
});
