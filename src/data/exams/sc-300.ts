import type { Exam } from '../../lib/exam.ts'
import userIdentities from './sc-300/user-identities.ts'
import authentication from './sc-300/authentication.ts'
import workloadIdentities from './sc-300/workload-identities.ts'
import governance from './sc-300/governance.ts'

const sc300: Exam = {
  id: 'sc-300',
  title: 'SC-300: Microsoft ID およびアクセス管理者',
  language: 'ja-JP',
  description: '2026年10月28日適用予定版の学習要領を対象とした、日本語の独自問題600問です（確認日：2026-10-25）。非公式の学習用問題集で、本番の問題・形式・難易度を再現するものではありません。40〜60問はMicrosoft認定試験全般の目安であり、SC-300の固定問題数・上限ではありません。認証とアクセス管理は公式概要の25〜30%を表示していますが、詳細見出しは20〜25%と不一致のため、収録比率は両方を満たす25%にしています。日本語の本番試験への改訂適用時期を保証するものではありません。',
  kind: 'certification',
  authorship: 'original',
  officialHosts: ['learn.microsoft.com'],
  blueprint: {
    url: 'https://learn.microsoft.com/ja-jp/credentials/certifications/resources/study-guides/sc-300',
    reviewedOn: '2026-10-25',
    questionCount: { min: 40, max: 60 },
  },
  usageReview: {
    url: 'https://learn.microsoft.com/en-us/credentials/support/certification-exam-candidate-agreement',
    reviewedOn: '2026-10-25',
    notes: '受験者契約、試験セキュリティポリシー（https://learn.microsoft.com/en-us/credentials/support/exam-and-assessment-lab-security-policies）、Microsoft Learn利用条件（https://learn.microsoft.com/en-us/legal/termsofuse）を確認。実際の試験・公式練習問題・ダンプは取得・転載・翻訳せず、公開技術資料の事実を根拠に問題・選択肢・解説を独自作成する。資料本文・図表・ロゴは転載しない。人による内容・権利・正確性レビューはマージ前に別途必要で、自動検証は代替しない。学習要領は日英とも2026年10月28日版を参照し、確認日2026-10-25時点では適用予定。英語版の更新日と日本語の本番試験への適用時期は同一とは限らない。認証とアクセス管理の比率は日英とも概要25〜30%、詳細見出し20〜25%と不一致で、解消は未確認。概要の範囲を登録し、両方を満たす25%で収録する。他の3分野も各25%とし、各150問を収録。問題数40〜60問の根拠は https://learn.microsoft.com/en-us/credentials/support/exam-duration-exam-experience （確認日：2026-10-25）にあるMicrosoft認定試験全般の一般目安で、SC-300固有の確定値・上限ではない。収録数の計画には目安の上限60問を使用。',
  },
  domains: [
    { id: 'user-identities', name: 'ユーザー ID の実装と管理', weight: { min: 20, max: 25 } },
    { id: 'authentication', name: '認証とアクセス管理を実装する', weight: { min: 25, max: 30 } },
    { id: 'workload-identities', name: 'ワークロード ID の計画と実装', weight: { min: 20, max: 25 } },
    { id: 'governance', name: 'ID ガバナンスの計画と自動化', weight: { min: 20, max: 25 } },
  ],
  questions: [...userIdentities, ...authentication, ...workloadIdentities, ...governance],
}

export default sc300
