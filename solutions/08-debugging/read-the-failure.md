# 第 08 章「自分の言葉で書き直す」の解答例

`broken.e2e.ts` の 1〜5 を、失敗ブロックと `trace.md` から直す手順の例です。

| # | 失敗ブロックで見るもの | `trace.md` で見るもの | 直し方（`fixed.e2e.ts`） |
| --- | --- | --- | --- |
| 1 | `LOCATOR_NOT_FOUND` と `getByRole("button", name: "Create")` | Screen at failure に `button "Add"` がある | 名前を画面の言葉 `Add` に合わせる |
| 2 | `expected: text "Loaded"` / `observed: no node` | Steps の `expect gave up ...: no node`、画面に `heading "Loaded"` はある | `status` ではなく `heading` を指す。`status` は消えたことを `toBeHidden()` で確認 |
| 3 | `expected "0 remaining" to be "1 remaining"`、行は `expect(text)` の行 | Steps に `textContent` が 1 回だけ読んだ記録 | 読み取りをやめて `await expect(ロケータ).toHaveText(...)` で待つ |
| 4 | `observed: text "0 remaining"` と `❯ app 1 error logged` | App log に `POST /api/todos 500 Internal Server Error` | テストは正しい。アプリ（ここでは route で作った 500）が原因。直すのはアプリ側 |
| 5 | `SEED_DATA_MISSING: ... no todo named "Nonexistent" is present` | Steps の agent の要約と `--debug` の表 | ゴールが前提とするデータを先に作る（`seedTodos` や `act` で追加） |
