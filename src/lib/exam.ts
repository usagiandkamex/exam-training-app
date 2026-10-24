export interface Reference {
  title: string
  url: string
}

export interface Domain {
  id: string
  name: string
  weight: { min: number; max: number } | null
}

export interface Question {
  id: string
  domainId: string
  prompt: string
  choices: { id: string; text: string }[]
  correctChoiceIds: string[]
  explanation: string
  references: Reference[]
}

export interface Exam {
  id: string
  title: string
  description: string
  kind: 'demo' | 'certification'
  authorship: 'original'
  officialHosts: string[]
  blueprint: {
    url: string
    reviewedOn: string
    questionCount: { min: number; max: number }
  } | null
  usageReview: { url: string; reviewedOn: string; notes: string } | null
  domains: Domain[]
  questions: Question[]
}

function isOfficialUrl(value: string, hosts: string[]): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password &&
      !url.port && hosts.includes(url.hostname)
  } catch {
    return false
  }
}

function isReviewDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
}

export function validateExam(exam: Exam): string[] {
  const errors: string[] = []
  const require = (condition: boolean, message: string) => {
    if (!condition) errors.push(`${exam.id}: ${message}`)
  }
  require(Boolean(exam.id.trim() && exam.title.trim() && exam.description.trim()), '基本情報が必要です')
  require(exam.kind === 'demo' || exam.kind === 'certification', '試験種別が不正です')
  require(exam.authorship === 'original', '独自作問のみ登録できます')
  require(exam.officialHosts.length > 0, '公式参照先のホストが必要です')
  require(exam.domains.length > 0, '分野が必要です')
  require(exam.questions.length > 0, '問題が必要です')
  require(new Set(exam.domains.map((domain) => domain.id)).size === exam.domains.length, '分野IDが重複しています')
  require(new Set(exam.questions.map((question) => question.id)).size === exam.questions.length, '問題IDが重複しています')

  for (const domain of exam.domains) {
    require(Boolean(domain.id.trim() && domain.name.trim()), '分野のIDと名称が必要です')
    require(exam.questions.some((question) => question.domainId === domain.id), `${domain.id}: 問題がありません`)
    if (domain.weight) {
      require(Number.isFinite(domain.weight.min) && Number.isFinite(domain.weight.max) &&
        domain.weight.min >= 0 && domain.weight.max <= 100 &&
        domain.weight.min <= domain.weight.max, `${domain.id}: 出題比率が不正です`)
    }
  }

  for (const question of exam.questions) {
    const prefix = `${question.id}: `
    const choiceIds = question.choices.map((choice) => choice.id)
    require(Boolean(question.id.trim() && question.prompt.trim() && question.explanation.trim()), `${prefix}問題文と解説が必要です`)
    require(exam.domains.some((domain) => domain.id === question.domainId), `${prefix}未定義の分野です`)
    require(question.choices.length >= 2 && question.choices.every((choice) => Boolean(choice.id.trim() && choice.text.trim())), `${prefix}選択肢が不正です`)
    require(new Set(choiceIds).size === choiceIds.length, `${prefix}選択肢IDが重複しています`)
    require(question.correctChoiceIds.length > 0 &&
      question.correctChoiceIds.length < question.choices.length &&
      new Set(question.correctChoiceIds).size === question.correctChoiceIds.length &&
      question.correctChoiceIds.every((id) => choiceIds.includes(id)), `${prefix}正解IDが不正です`)
    require(question.references.length > 0 &&
      question.references.every((ref) => Boolean(ref.title.trim()) && isOfficialUrl(ref.url, exam.officialHosts)), `${prefix}公式HTTPS参照先が必要です`)
  }

  if (exam.kind === 'certification') {
    const blueprint = exam.blueprint
    const review = exam.usageReview
    require(Boolean(blueprint && isOfficialUrl(blueprint.url, exam.officialHosts) &&
      isReviewDate(blueprint.reviewedOn)), '公式学習要領と確認日が必要です')
    require(Boolean(review && isOfficialUrl(review.url, exam.officialHosts) &&
      isReviewDate(review.reviewedOn) && review.notes.trim()), '利用条件の確認記録が必要です')
    if (blueprint) {
      const { min, max } = blueprint.questionCount
      require(Number.isInteger(min) && Number.isInteger(max) && min > 0 && min <= max, '公式問題数の範囲が不正です')
      require(exam.questions.length >= max * 5, '公式試験問題数の上限の5倍以上の問題が必要です')
    }
    require(exam.domains.every((domain) => domain.weight !== null), '公式の分野別出題比率が必要です')
    const minTotal = exam.domains.reduce((sum, domain) => sum + (domain.weight?.min ?? 0), 0)
    const maxTotal = exam.domains.reduce((sum, domain) => sum + (domain.weight?.max ?? 0), 0)
    require(minTotal <= 100 && maxTotal >= 100, '出題比率の合計範囲に100%を含めてください')
    for (const domain of exam.domains) {
      if (!domain.weight) continue
      const count = exam.questions.filter((question) => question.domainId === domain.id).length
      const percentage = count / exam.questions.length * 100
      require(percentage >= domain.weight.min && percentage <= domain.weight.max, `${domain.id}: 問題集の構成比率が公式範囲外です`)
    }
  }
  return errors
}

export function validateCatalog(exams: Exam[]): string[] {
  const errors = exams.flatMap(validateExam)
  if (exams.length === 0) errors.push('試験カタログが空です')
  if (new Set(exams.map((exam) => exam.id)).size !== exams.length) errors.push('試験IDが重複しています')
  return errors
}
