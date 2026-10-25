import type { Exam } from '../../lib/exam.ts'
import identityGovernance from './sc-500/identity-governance.ts'
import storageNetwork from './sc-500/storage-network.ts'
import compute from './sc-500/compute.ts'
import postureMonitoring from './sc-500/posture-monitoring.ts'

const sc500: Exam = {
  id: 'sc-500',
  title: 'SC-500: クラウドおよび AI ワークロードに対するエンドツーエンドのセキュリティ制御の実装',
  language: 'ja-JP',
  description: '2026年10月25日に確認した公式学習ガイドに基づく、日本語の独自問題600問です。ガイド本文に改訂日・適用日の明記はありません。非公式の学習用問題集で、本番の問題・形式・難易度を再現するものではありません。40〜60問はMicrosoft認定試験全般の目安であり、SC-500の固定問題数・上限ではありません。問題集の日本語対応は、本番試験の日本語提供を保証しません。',
  kind: 'certification',
  authorship: 'original',
  officialHosts: ['learn.microsoft.com'],
  blueprint: {
    url: 'https://learn.microsoft.com/ja-jp/credentials/certifications/resources/study-guides/sc-500',
    reviewedOn: '2026-10-25',
    questionCount: { min: 40, max: 60 },
  },
  usageReview: {
    url: 'https://learn.microsoft.com/ja-jp/credentials/support/certification-exam-candidate-agreement',
    reviewedOn: '2026-10-25',
    notes: '受験者契約、試験セキュリティポリシー（https://learn.microsoft.com/ja-jp/credentials/support/exam-and-assessment-lab-security-policies）、Microsoft Learn利用条件（https://learn.microsoft.com/ja-jp/legal/termsofuse）を確認。実際の試験・公式練習問題・ダンプは取得・転載・翻訳せず、公開技術資料の事実に基づいて問題・選択肢・解説を独自作成する。資料本文・図表・ロゴは転載しない。人による内容・権利・正確性のレビューはマージ前に別途必要で、自動検証は代替しない。SC-500の公式学習ガイドは日英の4分野と比率が一致し、確認時点の本文には改訂日・適用日の明記がないため、確認日を記録する。認定資格は https://learn.microsoft.com/ja-jp/credentials/certifications/cloud-and-ai-security-engineer-associate/ 。SC-500固有の問題数は未確認。問題数40〜60問の根拠は https://learn.microsoft.com/en-us/credentials/support/exam-duration-exam-experience （確認日：2026-10-25）にあるMicrosoft認定試験全般の一般目安で、SC-500固有の確定値・上限ではない。収録数の計画には目安の上限60問を使用。問題言語ja-JPは本番試験の提供言語とは別で、日本語での受験提供は保証しない。',
  },
  domains: [
    { id: 'identity-governance', name: 'ID、アクセス、ガバナンスの管理', weight: { min: 20, max: 25 } },
    { id: 'storage-network', name: 'セキュリティで保護されたストレージ、データベース、ネットワーク', weight: { min: 25, max: 30 } },
    { id: 'compute', name: 'セキュリティで保護されたコンピューティング', weight: { min: 20, max: 25 } },
    { id: 'posture-monitoring', name: 'セキュリティ体制の管理と監視', weight: { min: 20, max: 25 } },
  ],
  questions: [...identityGovernance, ...storageNetwork, ...compute, ...postureMonitoring],
}

export default sc500
