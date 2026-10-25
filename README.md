# 試験対策ラボ

GitHub Pagesで公開する、非公式の選択式クイズアプリです。React・TypeScript・Viteと[Fluent UI React v9](https://react.fluentui.dev/)を使用します。ログインやバックエンドは不要です。

## 今回の公開範囲

- 分野を複数選択し、10問・20問・対象の全問から出題数を選択。
- 問題と選択肢を毎回ランダム化し、同じ学習内では重複出題しません。
- 1問ずつ回答を確定し、正解・解説・公式資料へのリンクを確認。
- 単一選択と複数選択に対応。複数選択は全一致のみ正解で、部分点はありません。
- 現在の問題数、回答数、正解数、回答済み問題の正答率、終了時の分野別結果と誤答の復習を表示。
- スマートフォン・PC向けのレスポンシブUI。キーボード操作、読み上げ通知、動きを減らす設定にも対応。

**DP-300「Microsoft Azure SQL ソリューションの管理」の日本語・非公式問題集600問と、「IT基礎・体験デモ」10問を公開しています。** Azure・AWS・CISSPなどの試験は[追加リクエスト](https://github.com/usagiandkamex/exam-training-app/issues/new?template=exam-request.yml)をもとに追加します。

DP-300は[公式学習ガイド](https://learn.microsoft.com/ja-jp/credentials/certifications/resources/study-guides/dp-300)で公開されている**2026年10月27日適用版**を対象にしています（確認日：2026-10-25、確認時点では適用予定）。分野と収録数は次のとおりです。

| 分野 | 公式の出題比率 | 収録数 |
| --- | --- | --- |
| データ プラットフォーム リソースの計画と実装 | 15〜20% | 100問 |
| セキュリティで保護された環境を実装する | 20〜25% | 130問 |
| データベース リソースを監視、構成、最適化する | 20〜25% | 130問 |
| タスクの自動化を構成して管理する | 15〜20% | 100問 |
| 高可用性とディザスター リカバリー（HA/DR）の環境を計画して構成する | 20〜25% | 140問 |

画面の40〜60問は[Microsoft認定試験全般の公式目安](https://learn.microsoft.com/en-us/credentials/support/exam-duration-exam-experience)であり、DP-300固有の固定問題数・上限ではありません（確認日：2026-10-25）。その目安の上限60問を収録数の計画に使い、10倍の600問を用意しています。公式問題・公式練習問題の転載ではなく、技術資料を根拠にした独自作問です。本番の形式・難易度・合否を再現・保証するものではありません。

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

PRでは同じ検証を行いますが、公開権限を付与せずデプロイしません。ブランチ保護またはrulesetで **`verify`を必須チェック**にし、問題データのレビューをマージ前に行ってください。この設定自体はワークフローからは変更しません。Viteの相対baseによりプロジェクト配下のURLでもアセットを読み込めます。静的な単一ページで、サーバー側のルーティング設定は不要です。

## 試験を追加する

UIではなくデータを追加します。型定義は`src/lib/exam.ts`、登録先は`src/data/catalog.ts`、実装例は`src/data/exams/demo.ts`です。情報収集には[試験作成の tips](#試験作成の-tips)も参照してください。

1. issueで対象試験・言語・公式学習要領・出題比率・問題数・利用条件を確認します。公式問題数が範囲の場合は、**上限を基準に10倍以上**を作成します。試験固有の問題数を確認できず、提供元が公式の一般目安を公開している場合は、その範囲を収録数の計画に使用できます。その場合は出典URL・確認日を`usageReview.notes`に記録し、説明とREADMEにも「試験固有の確定値ではない」と明記します。一般目安の根拠も確認できない場合は推測せず、正式問題集を公開しません。
2. `src/data/exams/<exam-id>.ts`を作り、`Exam`型のデータをdefault exportします。大きな問題集は`src/data/exams/<exam-id>/`配下へ分野別に分割できます。`kind: 'certification'`とし、`blueprint`に公式URL・確認日・問題数の範囲（または前項の公式目安）、`domains`に公式の分野と比率の下限・上限（%）を記録します。固定比率は下限・上限を同じ値にします。`officialHosts`には参照を許可する公式サイトの**正確なホスト名**を指定します。
3. `usageReview`に公式の利用条件URL、確認日（YYYY-MM-DD）、独自作問と公開に関する確認内容を記録します。必要に応じて許諾や適用ライセンスの根拠も記載します。PRには作成者・レビュー担当者と、参照した学習要領の版を記録してください。
4. 各問題に一意のID・分野ID・独自の問題文・選択肢・正解の選択肢ID・独自の解説・公式技術資料へのリンクを設定します。正解を選択肢の位置で指定しないでください。解説も番号やIDではなく内容・概念を参照します（選択肢は毎回並び替わります）。複数の正解IDを指定すると複数選択になります。
5. `src/data/catalog.ts`の`exams`配列に登録します。`npm test`で、問題数、全分野の存在、分野別の収録比率、ID、正解、解説、公式HTTPSリンク、確認情報を検証します。**デモの免除は正式試験には使わないでください。**
6. 人による内容・権利・正確性のレビューと、PC・スマートフォンでの動作確認を経てマージします。試験改訂時には根拠と問題を再確認します。

分野別の比率検証は**問題集全体の構成**に対して行います。分野指定や少数のランダム出題は比率を保証する模擬試験ではありません。試験ごとに問題数や形式は変わるため、ケーススタディ・並べ替え・ラボなど選択式以外の試験形式をこのアプリで再現できるとは表示しないでください。

## 試験作成の tips

今後の試験準備でも再利用できるよう、調べ方・つまずき・対処をこの節へ継続して追記します。tips には適用対象・公式の根拠URL・確認日を添え、確認済みの事実と未確認事項を区別してください。試験固有の調査結果やレビュー記録は対象のissue/PRに残します。

### MCPを活用した情報収集

- 利用可能であれば、提供元が公開する公式のMCPサーバーを優先します。MCPの検索結果やAIの要約だけで判断せず、返された公式URLの本文・適用条件・改訂日を確認します。
- 試験コードと言語を明示して公式の学習要領を探し、対象の版・分野・比率・本番問題数・利用条件の根拠を記録します。技術的な正誤は、その分野の公式技術資料で別途確認します。日本語版と英語版で改訂日が異なる場合は差分を確認し、採用した版を記録してください。
- MCPが未設定・利用不可の場合は公式サイトや公式リポジトリを直接確認し、調査方法と制約をissue/PRに残します。どちらでも確認できない項目は未確認と明示し、推測で埋めず、[試験を追加する](#試験を追加する)の公開条件に従います。
- 学習要領のURLと確認日は`blueprint`、利用条件の確認は`usageReview`、各問題の技術的根拠は`references`へ反映します。根拠の版・該当箇所や未解決点はissue/PRに残し、試験改訂時の再確認に使います。[公開コンテンツの方針](#公開コンテンツの方針)はMCPで取得した情報にも適用します。

### Microsoft Learn MCPの使い方

Microsoftの試験・技術資料を調べる際に利用できます。以下は[公式リポジトリ](https://github.com/MicrosoftDocs/mcp)で確認した内容です（確認日：2026-10-24）。最新の導入方法は同リポジトリと[公式ガイド](https://learn.microsoft.com/training/support/mcp)を参照してください。

- リモート接続先は`https://learn.microsoft.com/api/mcp`、通信方式はStreamable HTTPです。APIキーやログインは不要です。通常のWebページではないため、MCP対応クライアントから接続します。
- 以下はVS CodeのMCP設定例です。クライアントごとに設定形式が異なります。既存設定がある場合は上書きせず`servers`へ追加し、接続後に利用可能なツールを確認してください。

```json
{
  "servers": {
    "microsoft-learn": {
      "type": "http",
      "url": "https://learn.microsoft.com/api/mcp"
    }
  }
}
```

- `microsoft_docs_search`で公式資料を検索し、`microsoft_docs_fetch`で見つかったURLの本文を確認します。実装例が必要な場合は`microsoft_code_sample_search`も利用できます。ツール名・引数は変更され得るため、実際のクライアントが提示する定義に従ってください。
- 検索は試験コードと目的を絞ります。例：`DP-300 study guide skills measured`で学習要領を探し、各分野の技術的根拠はサービス名・機能名・制約を加えて別途調べます。

依頼例（対象試験に置き換えて使用）：

> Microsoft Learn MCPが利用可能なら使って、DP-300の公式学習要領と利用条件を調べてください。公式URL・版や改訂日・確認日を示し、分野・比率・本番問題数について確認できた事実と未確認事項を分けてください。問題はまだ作成せず、調査結果をラバーダックで点検してください。

### 作問前後のラバーダック

別の担当者やレビュー用エージェントに、次の観点で前提を問い直してもらいます。試験固有の指摘・対応・未解決点はissue/PRへ、他の試験にも役立つ発見は根拠とともにこの節へ追記してください。レビューの合意だけで正確性や利用許諾が確認できたとは扱いません。

- 作問前：試験コード・言語・学習要領の版は一致しているか。分野別の収録数は、既存の問題数・比率の公開条件を満たす計画か。根拠のない前提や未確認事項はないか。
- 作問後：問題文の条件だけで正解を特定できるか。各誤答を除外する理由も公式資料で説明できるか。複数選択の正解集合、サービスのプラン・バージョン・制約に矛盾がないか。
- 公開前：内容・権利の人によるレビューを済ませたか。自動テストはデータの構造・公開条件を検証するもので、技術的な正しさ・最新性・独自性の保証ではありません。既存の検証コマンドと動作確認も省略しないでください。

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