// 第 10 章「自分の言葉で書き直す」の解答例（e2e@0.25.0 request フィクスチャ版）。自分で書いてから見ること。
import { test } from '@e2e-dev/web';
import { expect } from 'e2e';
import { z } from 'zod';

const Todo = z.object({ id: z.number(), title: z.string(), done: z.boolean(), createdAt: z.number() });

test('reset clears the session', async ({ request }) => {
  const started = await request.post('/api/session');
  expect(started.status).toBe(201);
  const { sid } = expect(await started.json()).toMatchSchema(z.object({ sid: z.string() }));
  const headers = { 'X-Session-Id': sid };

  const firstRes = await request.post('/api/todos', { headers, json: { title: 'one' } });
  expect(firstRes.status).toBe(201);
  const first = expect(await firstRes.json()).toMatchSchema(Todo);

  const secondRes = await request.post('/api/todos', { headers, json: { title: 'two' } });
  expect(secondRes.status).toBe(201);

  const patched = await request.patch(`/api/todos/${first.id}`, { headers, json: { done: true } });
  expect(patched).toBeOK();

  const listRes = await request.get('/api/todos', { headers });
  expect(listRes).toBeOK();
  const todos = expect(await listRes.json()).toMatchSchema(z.array(Todo));
  expect(todos.filter((t) => t.done)).toHaveLength(1);

  const reset = await request.post('/api/reset', { headers });
  expect(reset.status).toBe(204);

  const afterReset = await request.get('/api/todos', { headers });
  expect(afterReset).toBeOK();
  expect(await afterReset.json()).toEqual([]);
});
