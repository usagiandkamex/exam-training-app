import type { Exam } from '../../lib/exam.ts'

const identity = 'https://learn.microsoft.com/ja-jp/entra/fundamentals/concept-fundamentals-security-defaults'
const backup = 'https://learn.microsoft.com/ja-jp/azure/backup/backup-overview'

const demo: Exam = {
  id: 'demo',
  title: 'IT基礎・体験デモ',
  description: '操作を体験するための独自問題です。資格試験の出題範囲や難易度を再現した問題集ではありません。',
  kind: 'demo',
  authorship: 'original',
  officialHosts: ['learn.microsoft.com'],
  blueprint: null,
  usageReview: null,
  domains: [
    { id: 'identity', name: '認証とアクセス管理', weight: null },
    { id: 'resilience', name: 'バックアップと可用性', weight: null },
  ],
  questions: [
    {
      id: 'identity-1', domainId: 'identity',
      prompt: 'パスワードが漏えいした場合にも、不正なサインインのリスクを減らしたいと考えています。最も適切な対策はどれですか。',
      choices: [
        { id: 'a', text: 'すべての利用者に同じパスワードを設定する' },
        { id: 'b', text: 'パスワードに加えて、多要素認証を要求する' },
        { id: 'c', text: 'サインインの監査ログを無効にする' },
        { id: 'd', text: 'パスワードを平文のメモに保存する' },
      ],
      correctChoiceIds: ['b'],
      explanation: '多要素認証は、パスワード以外の要素でも本人確認を行います。パスワードだけが漏えいした場合のリスクを低減できますが、あらゆる攻撃を防ぐ保証ではありません。共有パスワードや平文保存はリスクを増やし、ログの無効化は検知を妨げます。',
      references: [{ title: 'Microsoft Entra IDのセキュリティの既定値群', url: identity }],
    },
    {
      id: 'identity-2', domainId: 'identity',
      prompt: '監視担当者はデータベースの状態を閲覧するだけで、設定変更は行いません。権限の割り当てとして最も適切なのはどれですか。',
      choices: [
        { id: 'a', text: 'すべてのリソースの所有者権限を与える' },
        { id: 'b', text: '管理者のアカウントを共有する' },
        { id: 'c', text: '業務に必要な範囲の読み取り権限だけを与える' },
        { id: 'd', text: '権限を確認せず、すべての操作を許可する' },
      ],
      correctChoiceIds: ['c'],
      explanation: '最小特権の原則では、必要な対象と操作に限定して権限を与えます。閲覧業務に変更権限や所有者権限は不要です。個人を識別できない共有アカウントも監査性を低下させます。',
      references: [{ title: 'Azure RBACのベストプラクティス', url: 'https://learn.microsoft.com/ja-jp/azure/role-based-access-control/best-practices' }],
    },
    {
      id: 'identity-3', domainId: 'identity',
      prompt: '運用チームで管理者アカウントの安全性と操作の追跡性を高めます。適切な対策を2つ選んでください。',
      choices: [
        { id: 'a', text: '担当者ごとに個別のアカウントを使う' },
        { id: 'b', text: '全員で1つのアカウントを使う' },
        { id: 'c', text: '管理者にも多要素認証を要求する' },
        { id: 'd', text: '退職者のアカウントを有効なまま残す' },
      ],
      correctChoiceIds: ['a', 'c'],
      explanation: '個別アカウントは操作した主体の追跡に役立ち、多要素認証は不正なサインインのリスクを低減します。アカウントの共有や不要なアカウントの放置は避けます。複数選択は正解の組み合わせがすべて一致した場合のみ正解です。',
      references: [{ title: 'Microsoft EntraのID管理とアクセス管理のベストプラクティス', url: 'https://learn.microsoft.com/ja-jp/azure/security/fundamentals/identity-management-best-practices' }],
    },
    {
      id: 'identity-4', domainId: 'identity',
      prompt: 'アプリケーションからAzureのリソースにアクセスします。コード内で長期間有効な資格情報を管理する負担を減らすには、対応する環境で何を利用すべきですか。',
      choices: [
        { id: 'a', text: 'コードに管理者のパスワードを直接記述する' },
        { id: 'b', text: 'パスワードを公開リポジトリに保存する' },
        { id: 'c', text: '利用者全員の資格情報をアプリに配布する' },
        { id: 'd', text: 'マネージドIDを使い、必要な権限を割り当てる' },
      ],
      correctChoiceIds: ['d'],
      explanation: 'マネージドIDでは、アプリケーションに資格情報を直接保存せずに、対応するサービスへ認証できます。ただし認証できることと操作が許可されることは別であり、適切な権限の割り当ても必要です。',
      references: [{ title: 'AzureリソースのマネージドID', url: 'https://learn.microsoft.com/ja-jp/entra/identity/managed-identities-azure-resources/overview' }],
    },
    {
      id: 'identity-5', domainId: 'identity',
      prompt: '「本人であることの確認」と「その人が実行できる操作の判定」の組み合わせとして正しいものはどれですか。',
      choices: [
        { id: 'a', text: '本人確認は認証、操作の許可判定は認可' },
        { id: 'b', text: '本人確認は認可、操作の許可判定は認証' },
        { id: 'c', text: 'どちらもバックアップ' },
        { id: 'd', text: 'どちらも暗号化だけで実現する' },
      ],
      correctChoiceIds: ['a'],
      explanation: '認証は主体のIDを確認し、認可はその主体に許可された操作を判定します。サインインに成功した利用者でも、権限がなければ対象のデータを変更できません。',
      references: [{ title: '認証と認可', url: 'https://learn.microsoft.com/ja-jp/entra/identity-platform/authentication-vs-authorization' }],
    },
    {
      id: 'resilience-1', domainId: 'resilience',
      prompt: '毎晩バックアップは成功していますが、復元操作は一度も試していません。障害への備えとして最も適切な次の行動はどれですか。',
      choices: [
        { id: 'a', text: '成功通知があるため、復元の確認は今後も行わない' },
        { id: 'b', text: 'すべてのバックアップを削除する' },
        { id: 'c', text: '隔離された環境で復元手順と復元データを定期的に検証する' },
        { id: 'd', text: '本番データを削除してから初めて手順を考える' },
      ],
      correctChoiceIds: ['c'],
      explanation: 'バックアップの成功だけでは、必要な時間内に正しいデータへ復元できるとは限りません。本番に影響しない環境で、復元手順・データ・所要時間を確認します。バックアップの削除は復旧手段を失わせます。',
      references: [{ title: 'Azure Backupのベストプラクティス', url: 'https://learn.microsoft.com/ja-jp/azure/backup/backup-azure-best-practices' }],
    },
    {
      id: 'resilience-2', domainId: 'resilience',
      prompt: '障害が発生した際に「最大15分前までのデータ損失を許容する」という目標を表す指標はどれですか。',
      choices: [
        { id: 'a', text: 'RTO（目標復旧時間）' },
        { id: 'b', text: 'RPO（目標復旧時点）' },
        { id: 'c', text: 'CPU使用率' },
        { id: 'd', text: '画面の解像度' },
      ],
      correctChoiceIds: ['b'],
      explanation: 'RPOは時間で表した許容データ損失の目標です。一方、RTOはサービスを復旧するまでに許容する時間です。目標を定めたうえで、バックアップやレプリケーションの頻度・方式を設計します。',
      references: [{ title: '信頼性の目標を定義するための推奨事項', url: 'https://learn.microsoft.com/ja-jp/azure/well-architected/reliability/metrics' }],
    },
    {
      id: 'resilience-3', domainId: 'resilience',
      prompt: '可用性のためのレプリケーションを導入しました。それでも過去の時点に戻せるバックアップが必要となる理由として最も適切なのはどれですか。',
      choices: [
        { id: 'a', text: 'レプリケーションがあれば操作ミスは起こらなくなるため' },
        { id: 'b', text: 'レプリケーションは必ずオフラインで保管されるため' },
        { id: 'c', text: 'バックアップを作ると認証が不要になるため' },
        { id: 'd', text: '誤った更新や削除も複製先へ反映される可能性があるため' },
      ],
      correctChoiceIds: ['d'],
      explanation: '高可用性とバックアップは目的が異なります。複製は障害時の継続に役立ちますが、論理的な誤操作も反映することがあります。保存期間や復元時点を考慮したバックアップを併用します。',
      references: [{ title: 'Azure Backupの概要', url: backup }],
    },
    {
      id: 'resilience-4', domainId: 'resilience',
      prompt: 'バックアップを運用する際の適切な対策を2つ選んでください。',
      choices: [
        { id: 'a', text: '業務上の復旧要件に合わせて保存期間を決める' },
        { id: 'b', text: 'すべての利用者にバックアップの削除権限を与える' },
        { id: 'c', text: 'バックアップ失敗の通知を確認し、対処する' },
        { id: 'd', text: '復元に必要な権限や手順を一切記録しない' },
      ],
      correctChoiceIds: ['a', 'c'],
      explanation: '保存期間は復旧要件や適用されるルールに合わせ、失敗を検知したら対処します。削除権限は限定し、復元手順は適切に保護して整備します。バックアップは取得後の運用まで含めて設計する必要があります。',
      references: [{ title: 'Azure Backupのベストプラクティス', url: 'https://learn.microsoft.com/ja-jp/azure/backup/backup-azure-best-practices' }],
    },
    {
      id: 'resilience-5', domainId: 'resilience',
      prompt: '単一のデータセンターの障害でサービス全体が停止するリスクを減らしたいと考えています。設計時に最も検討すべきことはどれですか。',
      choices: [
        { id: 'a', text: '障害ドメインを分離し、必要に応じて複数の可用性ゾーンへ分散する' },
        { id: 'b', text: 'すべての構成要素を同じ場所に集約するだけにする' },
        { id: 'c', text: '監視を停止する' },
        { id: 'd', text: '復旧目標を設定しない' },
      ],
      correctChoiceIds: ['a'],
      explanation: '共通障害の影響を受けにくい場所に分散すると可用性の向上が期待できます。ゾーンを利用できるだけで自動的にアプリ全体が冗長化されるわけではなく、依存先や切り替え方法も含めて設計と検証が必要です。',
      references: [{ title: 'Azureの可用性ゾーン', url: 'https://learn.microsoft.com/ja-jp/azure/reliability/availability-zones-overview' }],
    },
  ],
}

export default demo
