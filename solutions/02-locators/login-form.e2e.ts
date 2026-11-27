// 第 02 章「自分の言葉で書き直す」の解答例。自分で書いてから見ること。
import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

test('a wrong password shows an alert', async ({ app, screen }) => {
  await app.open('/login');
  await screen.getByLabel('Username').fill('alice');
  await screen.getByLabel('Password').fill('wrong');
  // ヘッダーの link "Sign in" と区別するため、ロールを button にする
  await screen.getByRole('button', 'Sign in').tap();
  await expect(screen.getByRole('alert')).toHaveText('Invalid username or password');
});
