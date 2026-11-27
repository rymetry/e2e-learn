// 第 09 章「自分の言葉で書き直す」の解答例。自分で書いてから見ること。
import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

test('sign out from a restored session', { session: 'alice' }, async ({ app, browser, screen }) => {
  await app.open('/todos');
  await expect(screen.getByText('Signed in as alice')).toBeVisible();
  await screen.getByLabel('New todo').fill('Before signing out');
  await screen.getByRole('button', 'Add').tap();
  await expect(screen.getByRole('status')).toHaveText('1 remaining');

  await screen.getByRole('button', 'Sign out').tap();
  await expect(screen.getByRole('link', 'Sign in')).toBeVisible();

  await app.open('/settings/billing');
  await expect(browser).toHaveURL('/login');
});
