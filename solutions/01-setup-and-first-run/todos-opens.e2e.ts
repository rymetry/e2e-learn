// 第 01 章「自分の言葉で書き直す」の解答例。自分で書いてから見ること。
import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

test('todos page opens', async ({ app, browser }) => {
  await app.open('/todos');
  await expect(browser).toHaveURL('/todos');
  await expect(browser.locator('body')).toBeVisible();
});
