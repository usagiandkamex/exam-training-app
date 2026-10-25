import type { Exam } from '../../lib/exam.ts'
import resources from './dp-300/resources.ts'
import security from './dp-300/security.ts'
import optimization from './dp-300/optimization.ts'
import automation from './dp-300/automation.ts'
import hadr from './dp-300/hadr.ts'

const dp300: Exam = {
  id: 'dp-300',
  title: 'DP-300: Microsoft Azure SQL ソリューションの管理',
  description: '2026年10月27日適用版の公開済み学習要領を対象とした、日本語の独自問題600問です。非公式の学習用問題集で、本番の問題・形式・難易度を再現するものではありません。40〜60問はMicrosoft認定試験全般の目安であり、DP-300の固定問題数ではありません。',
  kind: 'certification',
  authorship: 'original',
  officialHosts: ['learn.microsoft.com'],
  blueprint: {
    url: 'https://learn.microsoft.com/ja-jp/credentials/certifications/resources/study-guides/dp-300',
    reviewedOn: '2026-10-25',
    questionCount: { min: 40, max: 60 },
  },
  usageReview: {
    url: 'https://learn.microsoft.com/en-us/credentials/support/certification-exam-candidate-agreement',
    reviewedOn: '2026-10-25',
    notes: '受験者契約、試験セキュリティポリシー（https://learn.microsoft.com/en-us/credentials/support/exam-and-assessment-lab-security-policies）、Microsoft Learn利用条件（https://learn.microsoft.com/en-us/legal/termsofuse）を確認。実際の試験・公式練習問題・ダンプは取得・転載・翻訳せず、公開技術資料の事実を根拠に問題・選択肢・解説を独自作成する。権利上の許諾や人による内容レビューを自動検証で代替しない。学習要領は日英とも2026年10月27日適用版を参照。問題数40〜60問の根拠は https://learn.microsoft.com/en-us/credentials/support/exam-duration-exam-experience （確認日：2026-10-25）にあるMicrosoft認定試験全般の一般目安で、DP-300固有の確定値・上限ではない。収録数の計画には目安の上限60問を使用。',
  },
  domains: [
    { id: 'resources', name: 'データ プラットフォーム リソースの計画と実装', weight: { min: 15, max: 20 } },
    { id: 'security', name: 'セキュリティで保護された環境を実装する', weight: { min: 20, max: 25 } },
    { id: 'optimization', name: 'データベース リソースを監視、構成、最適化する', weight: { min: 20, max: 25 } },
    { id: 'automation', name: 'タスクの自動化を構成して管理する', weight: { min: 15, max: 20 } },
    { id: 'hadr', name: '高可用性とディザスター リカバリー（HA/DR）の環境を計画して構成する', weight: { min: 20, max: 25 } },
  ],
  questions: [...resources, ...security, ...optimization, ...automation, ...hadr],
}

export default dp300
