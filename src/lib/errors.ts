export type ErrorCategory =
  | 'setup'
  | 'locator'
  | 'agent'
  | 'runtime'
  | 'config';

export interface ErrorEntry {
  code: string;
  category: ErrorCategory;
  symptom: string;
  cause: string;
  fix: string;
  chapterSlug: string;
  chapterLabel: string;
}

export const ERROR_ENTRIES: readonly ErrorEntry[] = [
  {
    code: 'NODE_UNSUPPORTED',
    category: 'setup',
    symptom:
      'CLI 起動直後または設定読み込み時に実行環境非対応エラーで終了する。',
    cause:
      'Node.js が ^22.22.3 または >=24.8.0 の要件を満たしていない、もしくは未対応のランタイムで実行している。',
    fix: 'Node.js 22.22.3 以降または 24.8.0 以降へ切り替え、`node -v` と `npx e2e doctor` で確認する。',
    chapterSlug: '01-setup-and-first-run',
    chapterLabel: '第 01 章 環境構築と最初の実行',
  },
  {
    code: 'TYPESCRIPT_COMPILER_UNAVAILABLE',
    category: 'setup',
    symptom:
      'TypeScript の設定ファイルやテストファイルのコンパイル開始時に失敗する。',
    cause:
      'oxc のネイティブバインディング（`@oxc-transform/binding-*` 等）が `--omit=optional` や別 OS の lockfile により未導入になっている。',
    fix: '`--omit=optional` を外し、lockfile と `node_modules` を再生成して依存関係を入れ直す。',
    chapterSlug: '01-setup-and-first-run',
    chapterLabel: '第 01 章 環境構築と最初の実行',
  },
  {
    code: 'IMAGE_CODEC_UNAVAILABLE',
    category: 'setup',
    symptom:
      'スクリーンショットの撮影・比較（`toHaveScreenshot` 等）の初回実行時に失敗する。',
    cause:
      'PNG 読み書きを担う `@napi-rs/image` のプラットフォーム向けネイティブバインディングが導入されていない。',
    fix: 'optional dependencies を含めて再インストールし、対応アーキテクチャの環境で実行する。',
    chapterSlug: '11-page-objects-and-visual',
    chapterLabel: '第 11 章 Page Object とビジュアルテスト',
  },
  {
    code: 'BROWSER_INSTALL_FAILED',
    category: 'setup',
    symptom: 'テスト実行前のブラウザ自動セットアップが失敗する。',
    cause:
      'ネットワーク遮断、プロキシ設定不足、またはキャッシュディレクトリの権限不足でブラウザを取得できなかった。',
    fix: 'ネットワーク環境とプロキシ変数を確認し、`npx e2e doctor` で導入状況を点検して再試行する。',
    chapterSlug: '01-setup-and-first-run',
    chapterLabel: '第 01 章 環境構築と最初の実行',
  },
  {
    code: 'APP_UNREACHABLE',
    category: 'setup',
    symptom:
      'テスト対象アプリへ接続できず、起動待ちタイムアウトまたは接続失敗になる。',
    cause:
      '`app.url` にアプリが応答していない、`app.command` が起動前に異常終了した、または `startupTimeout` を超過した。',
    fix: '`app.url` のポートと `app.command` の手動起動結果を確認し、起動に時間がかかる場合は `startupTimeout` を延ばす。',
    chapterSlug: '01-setup-and-first-run',
    chapterLabel: '第 01 章 環境構築と最初の実行',
  },
  {
    code: 'APP_ALREADY_RUNNING',
    category: 'setup',
    symptom:
      '`app.command` 起動前に既に別プロセスがポートを使用中として停止する。',
    cause:
      '`readyUrl` がすでに疎通可能であり、かつ `reuseExisting: true` が指定されていない。',
    fix: '既存のサーバーを停止するか、ローカル開発時のみ `app.command.reuseExisting: true` を設定する。',
    chapterSlug: '01-setup-and-first-run',
    chapterLabel: '第 01 章 環境構築と最初の実行',
  },
  {
    code: 'AUTH_CREDENTIAL_UNAVAILABLE',
    category: 'setup',
    symptom:
      '認証情報を使うステップや `credentials.user()` 呼び出しで即座に失敗する。',
    cause:
      '`config.credentials` に指定名が存在しない、ランナー外から呼んだ、またはパスワードが 6 文字未満になっている。',
    fix: '`e2e.config.ts` の `credentials` 定義と対応する環境変数を確認し、6 文字以上のパスワードを設定する。',
    chapterSlug: '09-authentication',
    chapterLabel: '第 09 章 認証とシークレット',
  },
  {
    code: 'AUTH_CREDENTIAL_INVALID',
    category: 'setup',
    symptom:
      '設定済みのユーザー資格情報でサインインを試みたがアプリ側に拒否された。',
    cause:
      'テスト用アカウントのメールアドレス・パスワードが誤っているか、アカウントが無効化されている。',
    fix: 'テスト環境で対象ユーザーがログイン可能か手動確認し、`credentials` の値またはシードデータを修正する。',
    chapterSlug: '09-authentication',
    chapterLabel: '第 09 章 認証とシークレット',
  },
  {
    code: 'SECRET_UNAVAILABLE',
    category: 'setup',
    symptom: '`secrets.get()` による機密値の解決に失敗する。',
    cause:
      '`config.secrets` に定義がない、値が 6 文字未満、またはエンジン側で宣言していないシークレットを参照した。',
    fix: '`e2e.config.ts` の `secrets` と環境変数 `E2E_SECRET_*` を確認し、6 文字以上の値を設定する。',
    chapterSlug: '09-authentication',
    chapterLabel: '第 09 章 認証とシークレット',
  },
  {
    code: 'SESSION_UNAVAILABLE',
    category: 'setup',
    symptom: '認証済みセッションを前提とするテストが実行前に失敗する。',
    cause:
      'テストが消費する `session` を生成する setup テストが今回の実行対象に含まれていない。',
    fix: '該当セッションを生成する setup テストを絞り込み対象に含めるか、設定の `tests` グロブを見直す。',
    chapterSlug: '09-authentication',
    chapterLabel: '第 09 章 認証とシークレット',
  },
  {
    code: 'SESSION_EXPIRED',
    category: 'setup',
    symptom:
      '保存済みセッションの復元またはインポート時に有効期限エラーになる。',
    cause:
      '認証セッションの有効期限が切れている、または setup テストが現在時刻以前の期限を保存した。',
    fix: 'setup テストを再実行してセッションを作り直し、期限計算ロジックを見直す。',
    chapterSlug: '09-authentication',
    chapterLabel: '第 09 章 認証とシークレット',
  },
  {
    code: 'CONFIG_NOT_FOUND',
    category: 'config',
    symptom:
      'コマンド実行時に設定ファイルが見つからず終了コード 2 で終了する。',
    cause:
      'カレントディレクトリからリポジトリルートまでに `e2e.config.ts` 等が存在しない、または `--config` のパスが誤っている。',
    fix: 'プロジェクトルートで実行しているか確認し、未作成なら `npx e2e init` で `e2e.config.ts` を生成する。',
    chapterSlug: '01-setup-and-first-run',
    chapterLabel: '第 01 章 環境構築と最初の実行',
  },
  {
    code: 'CONFIG_LOAD_FAILED',
    category: 'config',
    symptom: '`e2e.config.ts` の読み込み・評価中に例外が発生する。',
    cause:
      '未インストールパッケージの import、誤ったサブパス参照、または設定評価時のランタイム例外が起きている。',
    fix: 'エラーメッセージに示されたモジュールや構文を確認し、依存関係の追加と設定ファイルの修正を行う。',
    chapterSlug: '01-setup-and-first-run',
    chapterLabel: '第 01 章 環境構築と最初の実行',
  },
  {
    code: 'INVALID_CONFIG',
    category: 'config',
    symptom:
      '設定検証に失敗し、テスト実行が始まる前に終了コード 2 で終了する。',
    cause:
      '未知の設定キー、範囲外の値、`web()` オプション誤り、廃止キーの残存、CI・`--watch`・`--workers > 1` 下での `--step` 指定など設定契約に違反している。',
    fix: 'エラー出力が示す対象キーと候補名を確認し、`e2e@0.25.0` の設定スキーマに合わせて修正する。',
    chapterSlug: '01-setup-and-first-run',
    chapterLabel: '第 01 章 環境構築と最初の実行',
  },
  {
    code: 'NO_TESTS',
    category: 'config',
    symptom: '実行可能なテストが見つからずエラー終了する。',
    cause:
      '`tests` グロブに一致するファイルがない、ファイル名が `*.e2e.ts` でない、除外パターンやフィルタですべて除外された。',
    fix: '`e2e.config.ts` の `tests` 設定とファイル名を確認し、0 件を許容したい場合のみ `--pass-with-no-tests` を付ける。',
    chapterSlug: '01-setup-and-first-run',
    chapterLabel: '第 01 章 環境構築と最初の実行',
  },
  {
    code: 'COLLECTION_ERROR',
    category: 'config',
    symptom: 'テストファイルの収集段階で構文・登録ルール違反として失敗する。',
    cause:
      'フィクスチャ引数を分割代入で書いていない、廃止された `requires` を使っている、フィクスチャの循環参照や `scope` 不一致がある。',
    fix: "引数は `async ({ screen }) => {}` 形式で記述し、プラットフォーム指定には `platforms: ['web']` を使う。",
    chapterSlug: '04-test-structure',
    chapterLabel: '第 04 章 テスト構造とフィクスチャ',
  },
  {
    code: 'ONLY_IN_CI',
    category: 'config',
    symptom: 'CI 環境でのみテスト収集時にエラーで停止する。',
    cause:
      'デバッグ用の `test.only` や `describe.only` がコードに残ったままコミットされている。',
    fix: '`.only` をすべて削除してからコミット・再実行する。',
    chapterSlug: '12-ci-and-reporters',
    chapterLabel: '第 12 章 CI とレポーター',
  },
  {
    code: 'TEST_SETUP_FAILED',
    category: 'config',
    symptom:
      'テスト前提条件の準備またはカスタムフィクスチャの初期化で失敗する。',
    cause:
      'テスト対象外の前提準備に失敗した、または `test.extend()` のフィクスチャが `use()` を 1 回ちょうど呼ばずに終了した。',
    fix: 'フィクスチャ関数内で必ず `await use(value)` を 1 回だけ呼び、後始末は `try / finally` で保護する。',
    chapterSlug: '04-test-structure',
    chapterLabel: '第 04 章 テスト構造とフィクスチャ',
  },
  {
    code: 'POLICY_DENIED',
    category: 'config',
    symptom:
      '遷移先アクセスや入力欄の操作がセキュリティポリシーにより拒否される。',
    cause:
      '許可されていない外部オリジンへの遷移、禁止されたスキーム、または機密フィールドの読み取りを試みた。',
    fix: '意図した遷移先であれば `security` ポリシーを見直し、不要な外部アクセスや機密読み取りを避ける。',
    chapterSlug: '09-authentication',
    chapterLabel: '第 09 章 認証とシークレット',
  },
  {
    code: 'REPLAY_STALE',
    category: 'config',
    symptom:
      '`--strict-cache` 有効時にキャッシュリプレイが失敗し、モデル呼び出しなしで終了する。',
    cause:
      'キャッシュミス、UI 変更による対象要素の消失・曖昧化、ビューポート変更などで保存済み記録がそのまま再生できなくなった。',
    fix: '`--strict-cache` を外した書き込み可能モードで再実行して記録を更新し、変更されたキャッシュファイルをコミットする。',
    chapterSlug: '07-replay-cache',
    chapterLabel: '第 07 章 リプレイキャッシュ',
  },
  {
    code: 'INVALID_LOCATOR',
    category: 'locator',
    symptom:
      'ロケータ生成または要素探索時にセレクタ構文エラーで即座に失敗する。',
    cause:
      '不正な CSS セレクタ、`xpath=` や `text=/(/` などの構文誤り、またはロケータ引数バリデーション違反がある。',
    fix: 'ロール・ラベルベースのロケータ（`screen.getByRole` / `screen.getByLabel`）を優先し、セレクタ構文の括弧や引用符を確認する。',
    chapterSlug: '02-locators',
    chapterLabel: '第 02 章 ロケータ',
  },
  {
    code: 'LOCATOR_NOT_FOUND',
    category: 'locator',
    symptom: '待機期限までに条件に一致する画面要素が見つからず失敗する。',
    cause:
      'ラベルやロール名の不一致、要素がまだ描画されていない、または画面遷移前の DOM を参照している。',
    fix: 'トレースや `--step` で実際のアクセシビリティツリーを確認し、役割・名前・フィルタ条件を実画面に合わせる。',
    chapterSlug: '02-locators',
    chapterLabel: '第 02 章 ロケータ',
  },
  {
    code: 'LOCATOR_AMBIGUOUS',
    category: 'locator',
    symptom:
      '単一要素に対するクリックや入力で、ポーリングせず即座に複数一致エラーになる。',
    cause:
      '同じロールやテキストを持つ要素が画面上に 2 件以上存在し、ロケータが一意に絞れていない。',
    fix: '親ロケータからのチェーン（`list.getByRole(...)`）や `.filter({ hasText })`、アクセシブルネームの明示で対象を 1 要素に絞り込む。',
    chapterSlug: '02-locators',
    chapterLabel: '第 02 章 ロケータ',
  },
  {
    code: 'ASSERTION_FAILED',
    category: 'locator',
    symptom:
      '`expect(...)` の検証または `agent.assert(...)` が期待と一致せず失敗する。',
    cause:
      '表示文言・状態・ステータスコード（`toBeOK()` 等）が期待値と異なる、またはアプリ側に不具合がある。',
    fix: 'エラー詳細の expected / observed とスクリーンショットを確認し、アプリ不具合かテスト期待値かを切り分ける。',
    chapterSlug: '03-expect',
    chapterLabel: '第 03 章 アサーション',
  },
  {
    code: 'ACTION_FAILED',
    category: 'locator',
    symptom:
      'クリック・入力・状態取得、または `request` 呼び出しが実行できず失敗する。',
    cause:
      '要素が無効化・重なりで操作不能、`inputValue()` / `isChecked()` を非対応要素へ呼んだ、または API リクエストがネットワーク失敗した。',
    fix: '操作前に要素の表示・有効状態を検証し、API テストでは対象サーバーの稼働状況と URL を確認する。',
    chapterSlug: '02-locators',
    chapterLabel: '第 02 章 ロケータ',
  },
  {
    code: 'EVALUATE_FAILED',
    category: 'locator',
    symptom:
      '`browser.evaluate` やページ内スクリプト実行時にエラーが発生する。',
    cause:
      'ページ内で実行した関数が例外を投げた、またはページ側コードが標準組み込みオブジェクトを上書きした。',
    fix: '評価関数の引数・戻り値がシリアライズ可能か確認し、ページ側のコンソールエラーとスタックトレースを調べる。',
    chapterSlug: '08-debugging',
    chapterLabel: '第 08 章 デバッグとエラー解析',
  },
  {
    code: 'MODEL_UNAVAILABLE',
    category: 'agent',
    symptom:
      '`agent` フィクスチャ取得時または初回モデル呼び出し時に実行が停止する。',
    cause:
      '`agents.<name>.model` にモデルが未設定、または使用中のアカウントが指定モデルを提供していない。',
    fix: '`e2e.config.ts` で有効なモデルを設定するか、モデル不要の決定論的ステップ（`screen` / `expect`）で記述する。',
    chapterSlug: '06-agent-steps',
    chapterLabel: '第 06 章 エージェントステップ',
  },
  {
    code: 'MODEL_PROVIDER_FAILED',
    category: 'agent',
    symptom:
      'AI モデル呼び出しが通信失敗・認証失敗・120 秒無応答などで失敗する。',
    cause:
      'プロバイダの API キー環境変数が未設定または無効、レート制限超過、5xx 障害、あるいはモデル応答が 120 秒を超えた。',
    fix: 'エラーに示された API キー環境変数（例: `AI_GATEWAY_API_KEY`）とプロバイダ稼働状況を確認し、`npx e2e doctor --check-model` を実行する。',
    chapterSlug: '06-agent-steps',
    chapterLabel: '第 06 章 エージェントステップ',
  },
  {
    code: 'MODEL_REFUSED',
    category: 'agent',
    symptom: 'モデルがコンテンツフィルタ等で応答を拒否しステップが中断される。',
    cause:
      'プロンプト文面や画面内容がモデル側の安全ポリシーに抵触し、`content-filter` で終了した。',
    fix: '指示文をより具体的かつ中立な操作手順へ言い換えるか、決定論的ロケータ操作へ置き換える。',
    chapterSlug: '06-agent-steps',
    chapterLabel: '第 06 章 エージェントステップ',
  },
  {
    code: 'MODEL_OUTPUT_INVALID',
    category: 'agent',
    symptom: '`agent.extract` などの構造化出力がスキーマ検証エラーで失敗する。',
    cause:
      '自動修復リトライを使い切っても、モデルの出力が指定した Zod スキーマに合致しなかった。',
    fix: 'スキーマの項目名・説明を明確にし、1 ステップで抽出する項目を小さく分割する。',
    chapterSlug: '06-agent-steps',
    chapterLabel: '第 06 章 エージェントステップ',
  },
  {
    code: 'CONTEXT_OVERFLOW',
    category: 'agent',
    symptom: 'エージェントステップ実行中にコンテキスト長超過で失敗する。',
    cause:
      'ページの観測データと操作履歴がモデルのコンテキストウィンドウ上限を超えた。',
    fix: '`agents.<name>.maxObservationBytes` を下げるか、長い指示を複数の短いステップへ分割する。',
    chapterSlug: '06-agent-steps',
    chapterLabel: '第 06 章 エージェントステップ',
  },
  {
    code: 'ASSERTION_INCONCLUSIVE',
    category: 'agent',
    symptom: '`agent.assert` または `agent.extract` が判定不能として失敗する。',
    cause:
      '対象領域が画面外・読み込み中・情報不足で、モデルが真偽や値を断定できなかった。',
    fix: '先に `expect(locator).toBeVisible()` 等で描画完了を待ってから呼び出し、視覚確認が必要なら `vision` 設定を見直す。',
    chapterSlug: '06-agent-steps',
    chapterLabel: '第 06 章 エージェントステップ',
  },
  {
    code: 'STEP_BUDGET_EXHAUSTED',
    category: 'agent',
    symptom: 'エージェントステップが結論に至る前に回数上限へ到達して失敗する。',
    cause:
      '指示範囲が広すぎる、画面遷移がループしている、または `maxModelCalls` 上限が小さすぎる。',
    fix: 'トレースでループ箇所を確認し、決定論的な手順を `screen` で先に済ませてエージェントの担当範囲を絞る。',
    chapterSlug: '06-agent-steps',
    chapterLabel: '第 06 章 エージェントステップ',
  },
  {
    code: 'STEP_TIMEOUT',
    category: 'agent',
    symptom:
      '単一のエージェントステップまたは待機処理がタイムアウトで終了する。',
    cause: 'アプリの応答遅延や条件未達のままステップ制限時間を使い切った。',
    fix: '最後の判定内容（`error.explanation`）とトレースを確認し、前提状態の待機不足やアプリの遅延を解消する。',
    chapterSlug: '06-agent-steps',
    chapterLabel: '第 06 章 エージェントステップ',
  },
  {
    code: 'STEP_NO_CONCLUSION',
    category: 'agent',
    symptom: 'エージェントが全ターンを消化しても完了判断を返せず失敗する。',
    cause: '完了条件が曖昧で、モデルが目標達成を判断できなかった。',
    fix: '指示文に達成後の明確な画面状態（表示文言や遷移先）を書き添える。',
    chapterSlug: '06-agent-steps',
    chapterLabel: '第 06 章 エージェントステップ',
  },
  {
    code: 'STEP_NOT_AWAITED',
    category: 'runtime',
    symptom:
      'テスト本体やフックの終了時に未待機ステップの検出エラーで失敗する。',
    cause:
      '`locator.tap()` や `screen.getByRole(...).tap()`、`expect.poll()`、`toPass()` などの非同期呼び出しに `await` を付け忘れている。',
    fix: 'エラー行に示された呼び出しへ `await` を追加し、すべてのステップが完了してからテストを抜けるようにする。',
    chapterSlug: '08-debugging',
    chapterLabel: '第 08 章 デバッグとエラー解析',
  },
  {
    code: 'TEST_TIMEOUT',
    category: 'runtime',
    symptom: 'テスト 1 件の総実行時間が `timeout` 上限を超えて強制終了する。',
    cause: '遅い処理や無限待機によりテスト全体の上限時間を超過した。',
    fix: 'トレースで滞留ステップを特定し、正当に時間のかかるテストのみ `test.setTimeout(ms)` や `test.slow()` を使う。',
    chapterSlug: '08-debugging',
    chapterLabel: '第 08 章 デバッグとエラー解析',
  },
  {
    code: 'PAUSE_UNAVAILABLE',
    category: 'runtime',
    symptom: 'CI 実行中に `screen.pause()` の呼び出し行で失敗する。',
    cause:
      '`CI` 環境変数が有効な環境では対話的に再開できないため `screen.pause()` が禁止されている。',
    fix: 'デバッグ用の `screen.pause()` をテストコードから削除して再実行する。',
    chapterSlug: '08-debugging',
    chapterLabel: '第 08 章 デバッグとエラー解析',
  },
  {
    code: 'APP_NOT_OPEN',
    category: 'runtime',
    symptom:
      '画面操作や要素検索を実行した瞬間にアプリ未起動状態として失敗する。',
    cause: '`await app.open()` を呼ぶ前に `screen` や `agent` を操作した。',
    fix: 'テスト先頭または `beforeEach` / フィクスチャ内で `await app.open()` を実行してから操作する。',
    chapterSlug: '08-debugging',
    chapterLabel: '第 08 章 デバッグとエラー解析',
  },
  {
    code: 'CANCELLED',
    category: 'runtime',
    symptom: 'MCP セッションやランナー操作がシグナル以外でキャンセルされた。',
    cause:
      'クライアント側のキャンセル、接続切断、MCP サーバー停止、または `AbortSignal` により中断された。',
    fix: 'MCP クライアントの接続状態やタイムアウト設定を確認し、必要に応じてセッションを開き直す。',
    chapterSlug: '08-debugging',
    chapterLabel: '第 08 章 デバッグとエラー解析',
  },
  {
    code: 'INTERRUPTED',
    category: 'runtime',
    symptom:
      'テストスイート全体が途中で中断され、終了コード 130 または 1 で終了する。',
    cause:
      'Ctrl+C や CI からの停止シグナルを受けた、あるいは `--max-failures` / `--max-duration` の上限に達した。',
    fix: '途中までのレポートを確認し、意図した上限到達であれば先行する失敗原因を修正して再実行する。',
    chapterSlug: '12-ci-and-reporters',
    chapterLabel: '第 12 章 CI とレポーター',
  },
  {
    code: 'UNHANDLED_REJECTION',
    category: 'runtime',
    symptom:
      '捕捉されない Promise rejection が発生し、テスト失敗またはランナーエラーになる。',
    cause:
      'バックグラウンドで開始した非同期処理やタイマー内で reject が処理されないまま残っている。',
    fix: 'すべての Promise を `await` または適切に `catch` し、テスト終了前に未完了の非同期処理を残さない。',
    chapterSlug: '08-debugging',
    chapterLabel: '第 08 章 デバッグとエラー解析',
  },
  {
    code: 'WORKER_CRASH',
    category: 'runtime',
    symptom:
      'テスト実行中にワーカープロセスが突然終了し、後続テストがスキップされる。',
    cause:
      'メモリ不足、ネイティブ拡張のクラッシュ、またはテスト開始前の未捕捉例外でワーカーが落ちた。',
    fix: '直前のテストログとメモリ使用量を確認し、並列数（`workers`）を下げて再現箇所を特定する。',
    chapterSlug: '12-ci-and-reporters',
    chapterLabel: '第 12 章 CI とレポーター',
  },
  {
    code: 'REPORT_WRITE_FAILED',
    category: 'runtime',
    symptom:
      'テスト完了後の `report.json` や `ai-trace.json` の書き出しに失敗する。',
    cause:
      '出力先ディレクトリの書き込み権限不足、ディスク容量不足、または不正な出力パスが指定されている。',
    fix: '出力ディレクトリの権限と空き容量を確認し、書き込み可能なパスを指定する。',
    chapterSlug: '12-ci-and-reporters',
    chapterLabel: '第 12 章 CI とレポーター',
  },
];

export function filterErrorEntries(
  entries: readonly ErrorEntry[],
  query: string,
  category: ErrorCategory | 'all',
): ErrorEntry[] {
  const normalizedQuery = query.trim().toLowerCase();
  return entries.filter((entry) => {
    if (category !== 'all' && entry.category !== category) {
      return false;
    }
    return (
      entry.code.toLowerCase().includes(normalizedQuery) ||
      entry.symptom.toLowerCase().includes(normalizedQuery) ||
      entry.cause.toLowerCase().includes(normalizedQuery) ||
      entry.fix.toLowerCase().includes(normalizedQuery)
    );
  });
}
