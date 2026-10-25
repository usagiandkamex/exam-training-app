import { test } from 'node:test'
import assert from 'node:assert/strict'
import { exams } from '../data/catalog.ts'
import dp300 from '../data/exams/dp-300.ts'
import { validateExam } from './exam.ts'
import { createSession, getStats, isCorrect, nextQuestion, submitAnswer } from './quiz.ts'

test('DP-300 is registered as an original certification bank without replacing the demo', () => {
  assert.ok(exams.includes(dp300))
  assert.ok(exams.some((exam) => exam.id === 'demo' && exam.kind === 'demo'))
  assert.equal(dp300.id, 'dp-300')
  assert.equal(dp300.kind, 'certification')
  assert.equal(dp300.authorship, 'original')
  assert.deepEqual(validateExam(dp300), [])
})

test('DP-300 preserves the five official domain weight ranges', () => {
  assert.deepEqual(dp300.domains.map(({ id, weight }) => ({ id, weight })), [
    { id: 'resources', weight: { min: 15, max: 20 } },
    { id: 'security', weight: { min: 20, max: 25 } },
    { id: 'optimization', weight: { min: 20, max: 25 } },
    { id: 'automation', weight: { min: 15, max: 20 } },
    { id: 'hadr', weight: { min: 20, max: 25 } },
  ])
  assert.ok(dp300.blueprint)
  assert.equal(dp300.blueprint.url, 'https://learn.microsoft.com/ja-jp/credentials/certifications/resources/study-guides/dp-300')
  assert.deepEqual(dp300.blueprint.questionCount, { min: 40, max: 60 })
  assert.ok(dp300.questions.length >= dp300.blueprint.questionCount.max * 10)
  assert.deepEqual(dp300.domains.map((domain) =>
    dp300.questions.filter((question) => question.domainId === domain.id).length), [100, 130, 130, 100, 140])
  for (const domain of dp300.domains) {
    const percentage = dp300.questions.filter((question) => question.domainId === domain.id).length / dp300.questions.length * 100
    assert.ok(percentage >= domain.weight!.min && percentage <= domain.weight!.max, domain.id)
  }
})

test('DP-300 distinguishes the guide revision and the general question-count reference', () => {
  assert.ok(dp300.description.includes('2026年10月27日'))
  assert.ok(dp300.description.includes('Microsoft認定試験全般の目安'))
  assert.ok(dp300.usageReview)
  assert.ok(dp300.usageReview.notes.split(/\s+/).includes('https://learn.microsoft.com/en-us/credentials/support/exam-duration-exam-experience'))
  assert.equal(dp300.blueprint?.reviewedOn, '2026-10-25')
  assert.equal(dp300.usageReview.reviewedOn, '2026-10-25')
})

test('DP-300 questions have distinct prompts and choices, with both answer formats in every domain', () => {
  const normalize = (text: string) => text.normalize('NFKC').replace(/\s+/g, '').trim()
  assert.equal(new Set(dp300.questions.map((question) => normalize(question.prompt))).size, dp300.questions.length)
  for (const question of dp300.questions) {
    assert.equal(question.choices.length, 4, question.id)
    assert.equal(new Set(question.choices.map((choice) => normalize(choice.text))).size, 4, question.id)
    if (question.correctChoiceIds.length > 1) {
      assert.ok(question.prompt.includes(`${question.correctChoiceIds.length}つ`), question.id)
    }
  }
  for (const domain of dp300.domains) {
    const questions = dp300.questions.filter((question) => question.domainId === domain.id)
    assert.ok(questions.some((question) => question.correctChoiceIds.length === 1), domain.id)
    assert.ok(questions.some((question) => question.correctChoiceIds.length > 1), domain.id)
  }
})

test('DP-300 supports a full-bank session without duplicate questions or bank mutation', () => {
  const original = structuredClone(dp300)
  const session = createSession(dp300, dp300.domains.map((domain) => domain.id), dp300.questions.length, () => 0)
  assert.equal(session.questions.length, dp300.questions.length)
  assert.equal(new Set(session.questions.map((question) => question.id)).size, dp300.questions.length)
  for (const question of session.questions) {
    assert.equal(isCorrect(question, question.correctChoiceIds), true, question.id)
    assert.equal(isCorrect(question, []), false, question.id)
  }
  assert.deepEqual(dp300, original)
})

test('DP-300 domain selection, grading and completion use the existing quiz flow', () => {
  const selectedDomains = ['security', 'hadr']
  let session = createSession(dp300, selectedDomains, 20, () => 0.5)
  assert.equal(session.questions.length, 20)
  assert.ok(session.questions.every((question) => selectedDomains.includes(question.domainId)))
  for (let index = 0; index < 20; index++) {
    const question = session.questions[session.index]
    session = submitAnswer(session, question.correctChoiceIds)
    session = nextQuestion(session)
  }
  assert.equal(session.finished, true)
  assert.deepEqual(getStats(session), { answered: 20, correct: 20, accuracy: 100 })
})
