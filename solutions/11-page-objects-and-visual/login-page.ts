// 第 11 章「自分の言葉で書き直す」の解答例（ページオブジェクト）。自分で書いてから見ること。
import type { Locator, Screen, Secret } from 'e2e';

export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly error: Locator;

  constructor(readonly screen: Screen) {
    this.username = screen.getByLabel('Username');
    this.password = screen.getByLabel('Password');
    this.submit = screen.getByRole('button', 'Sign in');
    this.error = screen.getByRole('alert');
  }

  async signIn(username: string, password: string | Secret): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.tap();
  }
}
