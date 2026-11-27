// 第 03 章「自分の言葉で書き直す」の解答例。自分で書いてから見ること。
import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

test('the status reports which Delete was pressed', async ({ app, browser, screen }) => {
  await app.open('/ambiguous');
  const status = screen.getByRole('status');
  await expect(status).toBeEmpty();
  await screen.getByRole('region', 'Drafts').getByRole('button', 'Delete').tap();
  await expect(status).toHaveText('Deleted the draft');
  await expect(status).not.toContainText('published');
  await expect(browser).toHaveURL('/ambiguous');
});
