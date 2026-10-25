import { test } from 'node:test'
import assert from 'node:assert/strict'
import { exams } from '../data/catalog.ts'
import sc500 from '../data/exams/sc-500.ts'
import { validateExam } from './exam.ts'
import { createSession, getStats, isCorrect, nextQuestion, submitAnswer } from './quiz.ts'

test('SC-500 is registered as an original Japanese certification without replacing existing banks', () => {
  assert.ok(exams.includes(sc500))
  for (const id of ['dp-300', 'ai-200']) {
    assert.ok(exams.some((exam) => exam.id === id && exam.kind === 'certification'))
  }
  assert.equal(sc500.id, 'sc-500')
  assert.equal(sc500.language, 'ja-JP')
  assert.equal(sc500.kind, 'certification')
  assert.equal(sc500.authorship, 'original')
  assert.deepEqual(validateExam(sc500), [])
})

test('SC-500 preserves the four official domain ranges and the 600-question allocation', () => {
  assert.deepEqual(sc500.domains.map(({ id, weight }) => ({ id, weight })), [
    { id: 'identity-governance', weight: { min: 20, max: 25 } },
    { id: 'storage-network', weight: { min: 25, max: 30 } },
    { id: 'compute', weight: { min: 20, max: 25 } },
    { id: 'posture-monitoring', weight: { min: 20, max: 25 } },
  ])
  assert.equal(sc500.blueprint?.url, 'https://learn.microsoft.com/ja-jp/credentials/certifications/resources/study-guides/sc-500')
  assert.deepEqual(sc500.blueprint?.questionCount, { min: 40, max: 60 })
  assert.equal(sc500.questions.length, 600)
  assert.deepEqual(sc500.domains.map((domain) =>
    sc500.questions.filter((question) => question.domainId === domain.id).length), [140, 180, 140, 140])
})

test('SC-500 distinguishes verification date, general exam count and question language from exam guarantees', () => {
  assert.equal(sc500.blueprint?.reviewedOn, '2026-10-25')
  assert.equal(sc500.usageReview?.reviewedOn, '2026-10-25')
  assert.ok(sc500.usageReview)
  assert.equal(sc500.usageReview.url, 'https://learn.microsoft.com/ja-jp/credentials/support/certification-exam-candidate-agreement')
  assert.ok(sc500.usageReview.notes.split(/\s+/).some((token) =>
    token === 'https://learn.microsoft.com/en-us/credentials/support/exam-duration-exam-experience'))
  for (const text of ['Microsoft認定試験全般', 'SC-500', '改訂日・適用日', '日本語', '保証しません']) {
    assert.ok(sc500.description.includes(text), text)
  }
  assert.ok(sc500.usageReview.notes.includes('人による内容・権利・正確性のレビュー'))
  assert.ok(sc500.usageReview.notes.includes('SC-500固有の問題数は未確認'))
})

test('SC-500 questions have distinct Japanese prompts and choices with explicit multiple-answer counts', () => {
  const normalize = (text: string) => text.normalize('NFKC').replace(/\s+/g, '')
  assert.equal(new Set(sc500.questions.map((question) => normalize(question.prompt))).size, 600)
  for (const question of sc500.questions) {
    assert.equal(question.choices.length, 4, question.id)
    assert.equal(new Set(question.choices.map((choice) => normalize(choice.text))).size, 4, question.id)
    assert.match(question.prompt, /[ぁ-んァ-ヶ一-龠]/, question.id)
    assert.match(question.explanation, /[ぁ-んァ-ヶ一-龠]/, question.id)
    if (question.correctChoiceIds.length > 1) {
      assert.ok(question.prompt.includes(`${question.correctChoiceIds.length}つ`), question.id)
    }
  }
  for (const domain of sc500.domains) {
    const questions = sc500.questions.filter((question) => question.domainId === domain.id)
    assert.ok(questions.some((question) => question.correctChoiceIds.length === 1), domain.id)
    assert.ok(questions.some((question) => question.correctChoiceIds.length > 1), domain.id)
  }
})

test('SC-500 sessions shuffle all questions without duplication, partial credit or source mutation', () => {
  const original = structuredClone(sc500)
  const session = createSession(sc500, sc500.domains.map((domain) => domain.id), 600, () => 0)
  assert.equal(session.questions.length, 600)
  assert.equal(new Set(session.questions.map((question) => question.id)).size, 600)
  for (const question of session.questions) {
    assert.equal(isCorrect(question, question.correctChoiceIds), true, question.id)
    assert.equal(isCorrect(question, []), false, question.id)
    if (question.correctChoiceIds.length > 1) {
      assert.equal(isCorrect(question, question.correctChoiceIds.slice(1)), false, question.id)
    }
  }
  assert.deepEqual(sc500, original)
})

test('SC-500 domain filtering, both answer formats and completion work with the existing quiz engine', () => {
  for (const domain of sc500.domains) {
    const pool = sc500.questions.filter((question) => question.domainId === domain.id)
    for (const multiple of [false, true]) {
      const question = pool.find((item) => (item.correctChoiceIds.length > 1) === multiple)!
      const session = createSession({ ...sc500, questions: [question] }, [domain.id], 10, () => 0.5)
      assert.equal(session.questions.length, 1)
      assert.equal(session.questions[0].domainId, domain.id)
      const finished = nextQuestion(submitAnswer(session, question.correctChoiceIds))
      assert.equal(finished.finished, true)
      assert.deepEqual(getStats(finished), { answered: 1, correct: 1, accuracy: 100 })
    }
  }
})
