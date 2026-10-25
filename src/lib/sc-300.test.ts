import { test } from 'node:test'
import assert from 'node:assert/strict'
import { exams } from '../data/catalog.ts'
import sc300 from '../data/exams/sc-300.ts'
import { validateExam } from './exam.ts'
import { createSession, getStats, isCorrect, nextQuestion, submitAnswer } from './quiz.ts'

test('SC-300 is registered as an original Japanese certification without replacing existing exams', () => {
  assert.ok(exams.includes(sc300))
  for (const id of ['dp-300', 'ai-200', 'sc-500']) {
    assert.ok(exams.some((exam) => exam.id === id && exam.kind === 'certification'))
  }
  assert.equal(sc300.id, 'sc-300')
  assert.equal(sc300.language, 'ja-JP')
  assert.equal(sc300.kind, 'certification')
  assert.equal(sc300.authorship, 'original')
  assert.deepEqual(validateExam(sc300), [])
})

test('SC-300 preserves official summary ranges and satisfies the conflicting authentication range', () => {
  assert.deepEqual(sc300.domains.map(({ id, weight }) => ({ id, weight })), [
    { id: 'user-identities', weight: { min: 20, max: 25 } },
    { id: 'authentication', weight: { min: 25, max: 30 } },
    { id: 'workload-identities', weight: { min: 20, max: 25 } },
    { id: 'governance', weight: { min: 20, max: 25 } },
  ])
  assert.ok(sc300.blueprint)
  assert.equal(sc300.blueprint.url, 'https://learn.microsoft.com/ja-jp/credentials/certifications/resources/study-guides/sc-300')
  assert.deepEqual(sc300.blueprint.questionCount, { min: 40, max: 60 })
  assert.equal(sc300.questions.length, 600)
  assert.ok(sc300.questions.length >= sc300.blueprint.questionCount.max * 10)
  assert.deepEqual(sc300.domains.map((domain) =>
    sc300.questions.filter((question) => question.domainId === domain.id).length), [150, 150, 150, 150])
  const authenticationPercentage = sc300.questions.filter((question) => question.domainId === 'authentication').length / sc300.questions.length * 100
  assert.equal(authenticationPercentage, 25)
})

test('SC-300 discloses its upcoming revision, general count guidance and unresolved official discrepancy', () => {
  assert.ok(sc300.usageReview)
  for (const text of ['2026年10月28日', '適用予定', 'Microsoft認定試験全般', 'SC-300', '固定問題数', '25〜30%', '20〜25%', '不一致']) {
    assert.ok(sc300.description.includes(text), text)
  }
  for (const text of ['2026年10月28日', '適用予定', '25〜30%', '20〜25%', '不一致', '未確認', '人による']) {
    assert.ok(sc300.usageReview.notes.includes(text), text)
  }
  assert.ok(sc300.usageReview.notes.split(/\s+/).some((token) =>
    token === 'https://learn.microsoft.com/en-us/credentials/support/exam-duration-exam-experience'))
  assert.equal(sc300.blueprint?.reviewedOn, '2026-10-25')
  assert.equal(sc300.usageReview.reviewedOn, '2026-10-25')
})

test('SC-300 has distinct Japanese questions and choices with both answer formats in every domain', () => {
  const normalize = (text: string) => text.normalize('NFKC').replace(/\s+/g, '').trim()
  assert.equal(new Set(sc300.questions.map((question) => normalize(question.prompt))).size, sc300.questions.length)
  for (const question of sc300.questions) {
    assert.equal(question.choices.length, 4, question.id)
    assert.equal(new Set(question.choices.map((choice) => normalize(choice.text))).size, 4, question.id)
    assert.match(question.prompt, /[ぁ-んァ-ヶ一-龠]/, question.id)
    assert.match(question.explanation, /[ぁ-んァ-ヶ一-龠]/, question.id)
    assert.doesNotMatch(question.explanation, /(?:選択肢|正解)[ 　]*[a-dａ-ｄＡ-Ｄ](?:[、。:：はがと]|$)/i, question.id)
    if (question.correctChoiceIds.length > 1) {
      assert.ok(question.prompt.includes(`${question.correctChoiceIds.length}つ`), question.id)
    }
  }
  for (const domain of sc300.domains) {
    const questions = sc300.questions.filter((question) => question.domainId === domain.id)
    assert.ok(questions.some((question) => question.correctChoiceIds.length === 1), domain.id)
    assert.ok(questions.some((question) => question.correctChoiceIds.length > 1), domain.id)
  }
})

test('SC-300 supports all 600 shuffled questions without duplication, partial credit or bank mutation', () => {
  const original = structuredClone(sc300)
  const session = createSession(sc300, sc300.domains.map((domain) => domain.id), sc300.questions.length, () => 0)
  assert.equal(session.questions.length, 600)
  assert.equal(new Set(session.questions.map((question) => question.id)).size, 600)
  for (const question of session.questions) {
    assert.equal(isCorrect(question, question.correctChoiceIds), true, question.id)
    assert.equal(isCorrect(question, []), false, question.id)
    assert.equal(isCorrect(question, [question.choices.find((choice) => !question.correctChoiceIds.includes(choice.id))!.id]), false, question.id)
    if (question.correctChoiceIds.length > 1) {
      assert.equal(isCorrect(question, question.correctChoiceIds.slice(1)), false, question.id)
    }
  }
  assert.deepEqual(sc300, original)
})

test('SC-300 filters each domain and grades both answer formats through completion', () => {
  for (const domain of sc300.domains) {
    const questions = sc300.questions.filter((question) => question.domainId === domain.id)
    const filtered = createSession(sc300, [domain.id], 10, () => 0.5)
    assert.equal(filtered.questions.length, 10)
    assert.ok(filtered.questions.every((question) => question.domainId === domain.id), domain.id)
    for (const multiple of [false, true]) {
      const question = questions.find((item) => (item.correctChoiceIds.length > 1) === multiple)!
      const session = createSession({ ...sc300, questions: [question] }, [domain.id], 10, () => 0.5)
      const finished = nextQuestion(submitAnswer(session, question.correctChoiceIds))
      assert.equal(finished.finished, true)
      assert.deepEqual(getStats(finished), { answered: 1, correct: 1, accuracy: 100 })
    }
  }
})
