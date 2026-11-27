// 付録 A「自分の言葉で書き直す」の解答例: reset_session ツール（e2e.config.ts）で、agent にセッションを初期化させる。
import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

test(
  'the agent resets the session through a project tool',
  { tags: ['agent'], agent: 'tooled' },
  async ({ app, screen, browser, agent }) => {
    await app.open('/todos');
    await screen.getByLabel('New todo').fill('Leftover');
    await screen.getByRole('button', 'Add').tap();
    await expect(screen.getByRole('status')).toHaveText('1 remaining');
    const sid = (await browser.cookies('/api/todos')).find((cookie) => cookie.name === 'sid')?.value;
    if (!sid) throw new Error('sid cookie is missing');

    await agent.act(
      'Using the reset_session tool, reset the session {sid}. Then confirm with the list_todos tool that it has no todos. Do not touch the page.',
      { params: { sid } },
    );

    await app.open('/todos');
    await expect(screen.getByRole('list', 'Todos').getByRole('listitem')).toHaveCount(0);
    await expect(screen.getByRole('status')).toHaveText('0 remaining');
  },
);
