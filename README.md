# 試験対策ラボ

GitHub Pagesで公開する、非公式の選択式クイズアプリです。React・TypeScript・Viteと[Fluent UI React v9](https://react.fluentui.dev/)を使用します。ログインやバックエンドは不要です。

## 今回の公開範囲

- 分野を複数選択し、10問・20問・対象の全問から出題数を選択。
- 問題と選択肢を毎回ランダム化し、同じ学習内では重複出題しません。
- 1問ずつ回答を確定し、正解・解説・公式資料へのリンクを確認。
- 単一選択と複数選択に対応。複数選択は全一致のみ正解で、部分点はありません。
- 現在の問題数、回答数、正解数、回答済み問題の正答率、終了時の分野別結果と誤答の復習を表示。
- スマートフォン・PC向けのレスポンシブUI。キーボード操作、読み上げ通知、動きを減らす設定にも対応。

**現在は独自作問の「IT基礎・体験デモ」10問だけです。正式な資格試験の対策問題集ではありません。DP-300は別issueで追加予定です。** Azure・AWS・CISSPなどの試験は[追加リクエスト](https://github.com/usagiandkamex/exam-training-app/issues/new?template=exam-request.yml)をもとに追加します。

回答はメモリ上だけに保持し、再読み込みや終了で消えます。学習履歴の送信・永続保存、広告、アクセス解析はありません。GitHub Pagesによるアクセス情報の取り扱いは[GitHubのプライバシー声明](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement)を参照してください。

## ローカル開発と検証

Node.js **22.18以上（推奨22系）**、npmを使用します。

```sh
npm ci
npm run dev
```

```sh
npm test          # Node標準テスト：採点・進捗・分野抽出・問題集の公開条件
npm run lint     # Viteテンプレート付属のOxlint
npm run build    # TypeScript型検査と静的ファイル生成
npm run preview  # 生成物をローカルで確認
```

テスト対象のTypeScriptはNodeの型除去で直接実行するため、enumなどコード生成を必要とする構文は使いません。ブラウザーでの確認はPCとiPhone 17相当の縦横表示を基準とし、320px以上の幅、200%ズーム、長文の折り返し、キーボード操作も確認してください。

## GitHub Pagesでの公開

1. リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に設定します（管理者による初回設定が必要です）。
2. この変更を既定ブランチの`main`へマージします。`.github/workflows/pages.yml`が依存導入・テスト・lint・ビルドを実行し、成功時だけ`dist`を公開します。
3. `github-pages`環境に承認が必要な場合は承認します。Actionsの`deploy`ジョブに表示される公開URLを確認します。
4. 公開先は通常 **https://usagiandkamex.github.io/exam-training-app/** です。`main`上からの`workflow_dispatch`でも再公開できます。

初回設定をActionsから行う場合は、このリポジトリだけを対象に **Pages: Read and write** を付与した有効期限付きfine-grained PATを、`github-pages`環境のシークレット **`PAGES_SETUP_TOKEN`** に登録してください。`configure-pages`はこのシークレットがある場合だけPagesの有効化を試みます。初回公開後はシークレットを削除でき、以降は標準の`GITHUB_TOKEN`で公開します。標準の`GITHUB_TOKEN`だけではPagesを初回有効化できません。

`configure-pages`で **Get Pages site failed / Not Found** になる場合は、Pagesが未設定でないか確認してください。手動設定後は失敗したジョブを再実行できます。シークレットで初回設定する場合は、このワークフロー変更を`main`へマージし、シークレット登録後に`main`から`workflow_dispatch`で新しい実行を開始してください（古い実行の再実行には変更前のワークフローが使われます）。

PRでは同じ検証を行いますが、公開権限を付与せずデプロイしません。ブランチ保護またはrulesetで **`verify`を必須チェック**にし、問題データのレビューをマージ前に行ってください。この設定自体はワークフローからは変更しません。Viteの相対baseによりプロジェクト配下のURLでもアセットを読み込めます。静的な単一ページで、サーバー側のルーティング設定は不要です。

## 試験を追加する

UIではなくデータを追加します。型定義は`src/lib/exam.ts`、登録先は`src/data/catalog.ts`、実装例は`src/data/exams/demo.ts`です。

1. issueで対象試験・言語・公式学習要領・出題比率・問題数・利用条件を確認します。公式問題数が範囲の場合は、**上限を基準に10倍以上**を作成します。不明な場合は推測せず、根拠を確認するまで正式問題集を公開しません。
2. `src/data/exams/<exam-id>.ts`を作り、`Exam`型のデータをdefault exportします。`kind: 'certification'`とし、`blueprint`に公式URL・確認日・本番問題数の範囲、`domains`に公式の分野と比率の下限・上限（%）を記録します。固定比率は下限・上限を同じ値にします。`officialHosts`には参照を許可する公式サイトの**正確なホスト名**を指定します。
3. `usageReview`に公式の利用条件URL、確認日（YYYY-MM-DD）、独自作問と公開に関する確認内容を記録します。必要に応じて許諾や適用ライセンスの根拠も記載します。PRには作成者・レビュー担当者と、参照した学習要領の版を記録してください。
4. 各問題に一意のID・分野ID・独自の問題文・選択肢・正解の選択肢ID・独自の解説・公式技術資料へのリンクを設定します。正解を選択肢の位置で指定しないでください。複数の正解IDを指定すると複数選択になります。
5. `src/data/catalog.ts`の`exams`配列に登録します。`npm test`で、問題数、全分野の存在、分野別の収録比率、ID、正解、解説、公式HTTPSリンク、確認情報を検証します。**デモの免除は正式試験には使わないでください。**
6. 人による内容・権利・正確性のレビューと、PC・スマートフォンでの動作確認を経てマージします。試験改訂時には根拠と問題を再確認します。

分野別の比率検証は**問題集全体の構成**に対して行います。分野指定や少数のランダム出題は比率を保証する模擬試験ではありません。試験ごとに問題数や形式は変わるため、ケーススタディ・並べ替え・ラボなど選択式以外の試験形式をこのアプリで再現できるとは表示しないでください。

## 公開コンテンツの方針

- 実際の試験問題、記憶による再現、試験ダンプを収集・投稿・転載しません。
- 公式練習問題も、転載・翻訳・近い言い換え・再構成は行いません。公開されていることは再配布の許可ではありません。公式の練習問題を案内する場合はリンクにします。
- 公式の学習要領から分野・比率を確認し、技術資料を根拠にシナリオ・選択肢・解説を**独自作成**します。公式図表・ブランドロゴなども無断で転載しません。
- 自動検証は権利確認・盗用検出を代行できません。`usageReview`の記入だけで法的適合を保証するものではなく、公開リポジトリへコミットする**前**に確認が必要です。第三者の権利が不明な内容は投稿しないでください。
- 本アプリは試験主催者と無関係で、承認・本番との同一性・合格を保証しません。商標は各権利者に帰属します。
- 誤りや権利上の懸念はissueで報告してください。実際の試験問題・秘密情報・個人情報は添付しないでください。

試験を追加する際に確認する公式資料（利用条件は更新され得るため、その都度再確認してください）：

- Microsoft：[受験者契約](https://learn.microsoft.com/en-us/credentials/support/certification-exam-candidate-agreement)、[試験のセキュリティポリシー](https://learn.microsoft.com/en-us/credentials/support/exam-and-assessment-lab-security-policies)、[Practice Assessmentsの案内](https://learn.microsoft.com/en-us/credentials/certifications/practice-assessments-for-microsoft-certifications)、[Microsoft利用規約](https://www.microsoft.com/en-us/legal/terms-of-use)
- AWS：[Certification Program Agreement](https://aws.amazon.com/certification/certification-agreement/)、[公式試験ガイド](https://docs.aws.amazon.com/aws-certification/latest/examguides/aws-certification-exam-guides.html)
- ISC2：[試験NDA](https://www.isc2.org/exams/non-disclosure-agreement)、[受験契約](https://www.isc2.org/exams/exam-agreement)、[CISSP試験概要](https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline)

アプリのソースコードは`LICENSE`のMIT Licenseに従います。外部資料・各社商標にはそれぞれの条件が適用されます。Fluent UIのライセンスは依存パッケージ内の通知を参照してください。