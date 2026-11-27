// 第 13 章「自分の言葉で書き直す」の解答例。サインインフォームの探索で出やすい finding の再現テスト。
// finding はモデル次第で変わるので、自分の finding で書くこと。
import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

test('an empty sign-in form is rejected with a message', async ({ app, browser, screen }) => {
  await app.open('/login');
  await screen.getByRole('button', 'Sign in').tap();
  await expect(screen.getByRole('alert')).toHaveText('Invalid username or password');
  await expect(browser).toHaveURL('/login');
});

test('a wrong password clears the password field and keeps the username', async ({ app, screen }) => {
  await app.open('/login');
  await screen.getByLabel('Username').fill('alice');
  await screen.getByLabel('Password').fill('wrong');
  await screen.getByRole('button', 'Sign in').tap();
  await expect(screen.getByRole('alert')).toBeVisible();
  await expect(screen.getByLabel('Username')).toHaveValue('alice');
  await expect(screen.getByLabel('Password')).toBeFocused();
});
