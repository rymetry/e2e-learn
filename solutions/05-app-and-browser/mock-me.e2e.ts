// 第 05 章「自分の言葉で書き直す」の解答例。自分で書いてから見ること。
import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

test('a mocked /api/me signs the header in', async ({ app, browser, screen }) => {
  await browser.route('**/api/me', async (route) => {
    await route.fulfill({ json: { username: 'alice' } });
  });
  await app.open('/');
  await expect(screen.getByText('Signed in as alice')).toBeVisible();
  await expect(screen.getByRole('button', 'Sign out')).toBeVisible();
  await expect(screen.getByRole('link', 'Sign in')).toHaveCount(0);
});
