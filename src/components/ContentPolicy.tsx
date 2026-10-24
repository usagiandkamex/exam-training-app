import { Link } from '@fluentui/react-components'

export function ContentPolicy() {
  return (
    <section id="content-policy" className="content-policy" aria-labelledby="policy-title">
      <h2 id="policy-title">公開方針と利用上の注意</h2>
      <p>
        このアプリは非公式の学習支援ツールです。各試験の主催者との提携・承認はなく、
        本番と同じ問題・難易度や合格を保証しません。
      </p>
      <details>
        <summary>問題の作成方針・公式の利用条件を確認する</summary>
        <p>
          公式の学習要領と技術資料を参考に、問題・選択肢・解説を独自に作成します。
          実際の試験問題、記憶からの再現問題、試験ダンプ、公式練習問題の転載・翻訳・改変は使用しません。
          参照リンクは転載許可を意味しません。
        </p>
        <p>
          正式な試験の追加前に、公式の出題範囲・比率・問題数と利用条件を確認し、確認日と根拠を記録します。
          自動検証だけでは権利関係を判断できないため、人によるレビューも行います。
        </p>
        <ul className="reference-list">
          <li><Link href="https://learn.microsoft.com/en-us/credentials/support/certification-exam-candidate-agreement" target="_blank" rel="noopener noreferrer">Microsoft 認定試験の受験者契約（別タブ）</Link></li>
          <li><Link href="https://learn.microsoft.com/en-us/credentials/certifications/practice-assessments-for-microsoft-certifications" target="_blank" rel="noopener noreferrer">Microsoft 公式のPractice Assessments（別タブ）</Link></li>
          <li><Link href="https://www.microsoft.com/en-us/legal/terms-of-use" target="_blank" rel="noopener noreferrer">Microsoft 利用規約（別タブ）</Link></li>
          <li><Link href="https://aws.amazon.com/certification/certification-agreement/" target="_blank" rel="noopener noreferrer">AWS Certification Program Agreement（別タブ）</Link></li>
          <li><Link href="https://www.isc2.org/exams/non-disclosure-agreement" target="_blank" rel="noopener noreferrer">ISC2 試験の秘密保持契約（別タブ）</Link></li>
        </ul>
        <p>
          各社の名称・商標は各権利者に帰属します。利用条件は変更される場合があります。
          権利上の懸念や問題の誤りは
          <Link href="https://github.com/usagiandkamex/exam-training-app/issues" target="_blank" rel="noopener noreferrer">GitHubのissue（別タブ）</Link>
          へご連絡ください。実際の試験問題や個人情報は投稿しないでください。
        </p>
      </details>
      <p className="muted">
        ログイン・広告・アクセス解析はありません。回答はこの画面内だけで保持し、再読み込みで消えます。
        ホスティング先のGitHubには、アクセスに伴う情報が送信されます。
        <Link href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">GitHubのプライバシー声明（別タブ）</Link>
      </p>
    </section>
  )
}
