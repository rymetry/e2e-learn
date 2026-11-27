// 第 04 章「自分の言葉で書き直す」の解答例。自分で書いてから見ること。
import { afterEach, beforeEach, describe, test } from '@e2e-dev/web';
import { expect } from 'e2e';

describe('ambiguous page', { tags: ['ambiguous'] }, () => {
  beforeEach(async ({ app }) => {
    await app.open('/ambiguous');
  });

  afterEach(async ({ app }) => {
    await app.screenshot('after');
  });

  test('deletes the draft', async ({ screen }) => {
    await screen.getByRole('region', 'Drafts').getByRole('button', 'Delete').tap();
    await expect(screen.getByRole('status')).toHaveText('Deleted the draft');
  });

  test('deletes the published post', async ({ screen }) => {
    await screen.getByRole('region', 'Published').getByRole('button', 'Delete').tap();
    await expect(screen.getByRole('status')).toHaveText('Deleted the published post');
  });
});
