// 第 08 章「一緒に書く」の修正版テスト（fixed.e2e.ts）。
import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

test('1. fixed: use the name on screen', async ({ app, screen }) => {
  await app.open('/todos');
  await screen.getByLabel('New todo').fill('Buy milk');
  await screen.getByRole('button', 'Add').tap();
  await expect(screen.getByRole('status')).toHaveText('1 remaining');
});

test('2. fixed: assert on the right node', async ({ app, screen }) => {
  await app.open('/slow');
  await expect(screen.getByRole('heading', 'Loaded')).toBeVisible();
  await expect(screen.getByRole('status')).toBeHidden();
});

test('3. fixed: wait instead of reading', async ({ app, screen }) => {
  await app.open('/todos');
  await screen.getByLabel('New todo').fill('Buy milk');
  await screen.getByRole('button', 'Add').tap();
  await expect(screen.getByRole('status')).toHaveText('1 remaining');
});

test('4. fixed: the app error is the finding, the test stays', async ({ app, browser, screen }) => {
  // 本物のアプリが落ちていたらテストは失敗すべき。ここでは「落ちていない」ことを確かめる形にする。
  const [response] = await Promise.all([
    browser.waitForResponse('**/api/todos'),
    (async () => {
      await app.open('/todos');
      await screen.getByLabel('New todo').fill('Buy milk');
      await screen.getByRole('button', 'Add').tap();
    })(),
  ]);
  expect(response.status).toBeLessThan(400);
  await expect(screen.getByRole('status')).toHaveText('1 remaining');
});
