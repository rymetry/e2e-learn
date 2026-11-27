// 第 11 章「自分の言葉で書き直す」の解答例（テスト）。tests/11-page-objects-and-visual/ に login-page.ts と一緒に置いて動かす。
import { test as base } from '@e2e-dev/web';
import { credentials, expect } from 'e2e';
import { LoginPage } from './login-page';

const test = base.extend<{ loginPage: LoginPage }>({
  loginPage: async ({ screen }, use) => {
    await use(new LoginPage(screen));
  },
});

test('rejects a wrong password', async ({ app, loginPage }) => {
  await app.open('/login');
  await loginPage.signIn('alice', 'not-the-password');
  await expect(loginPage.error).toHaveText('Invalid username or password');
});

test('signs in with the configured credential', async ({ app, browser, loginPage }) => {
  await app.open('/login');
  const alice = credentials.user('alice');
  await loginPage.signIn(alice.username, alice.password);
  await expect(browser).toHaveURL('/todos');
});
