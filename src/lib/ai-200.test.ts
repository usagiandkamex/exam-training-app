import { test } from 'node:test'
import assert from 'node:assert/strict'
import { exams } from '../data/catalog.ts'
import ai200 from '../data/exams/ai-200.ts'
import { validateExam } from './exam.ts'
import { createSession, getStats, isCorrect, nextQuestion, submitAnswer } from './quiz.ts'

test('AI-200 is registered as an original certification alongside DP-300', () => {
  assert.ok(exams.includes(ai200))
  assert.ok(exams.some((exam) => exam.id === 'dp-300' && exam.kind === 'certification'))
  assert.equal(ai200.id, 'ai-200')
  assert.equal(ai200.kind, 'certification')
  assert.equal(ai200.authorship, 'original')
  assert.deepEqual(validateExam(ai200), [])
})

test('AI-200 preserves the four official summary ranges and satisfies both published data ranges', () => {
  assert.deepEqual(ai200.domains.map(({ id, weight }) => ({ id, weight })), [
    { id: 'containers', weight: { min: 20, max: 25 } },
    { id: 'data', weight: { min: 30, max: 35 } },
    { id: 'integration', weight: { min: 20, max: 25 } },
    { id: 'security-monitoring', weight: { min: 20, max: 25 } },
  ])
  assert.ok(ai200.blueprint)
  assert.equal(ai200.blueprint.url, 'https://learn.microsoft.com/ja-jp/credentials/certifications/resources/study-guides/ai-200')
  assert.deepEqual(ai200.blueprint.questionCount, { min: 40, max: 60 })
  assert.equal(ai200.questions.length, 600)
  assert.ok(ai200.questions.length >= ai200.blueprint.questionCount.max * 10)
  assert.deepEqual(ai200.domains.map((domain) =>
    ai200.questions.filter((question) => question.domainId === domain.id).length), [150, 180, 135, 135])
  const dataPercentage = ai200.questions.filter((question) => question.domainId === 'data').length / ai200.questions.length * 100
  assert.ok(dataPercentage >= 25 && dataPercentage <= 30)
})

test('AI-200 records the guide revision, general question-count source and official discrepancy', () => {
  assert.ok(ai200.description.includes('2026年10月7日'))
  assert.ok(ai200.description.includes('Microsoft認定試験全般の目安'))
  assert.ok(ai200.usageReview)
  assert.ok(ai200.usageReview.notes.split(/\s+/).some((token) =>
    token === 'https://learn.microsoft.com/en-us/credentials/support/exam-duration-exam-experience'))
  for (const text of ['30〜35%', '25〜30%', '不一致']) {
    assert.ok(ai200.description.includes(text), text)
    assert.ok(ai200.usageReview.notes.includes(text), text)
  }
  assert.equal(ai200.blueprint?.reviewedOn, '2026-10-25')
  assert.equal(ai200.usageReview.reviewedOn, '2026-10-25')
})

test('AI-200 questions have distinct prompts and choices with both answer formats in every domain', () => {
  const normalize = (text: string) => text.normalize('NFKC').replace(/\s+/g, '').trim()
  assert.equal(new Set(ai200.questions.map((question) => normalize(question.prompt))).size, ai200.questions.length)
  for (const question of ai200.questions) {
    assert.equal(question.choices.length, 4, question.id)
    assert.equal(new Set(question.choices.map((choice) => normalize(choice.text))).size, 4, question.id)
    assert.match(question.prompt, /[ぁ-んァ-ヶ一-龠]/, question.id)
    assert.match(question.explanation, /[ぁ-んァ-ヶ一-龠]/, question.id)
    if (question.correctChoiceIds.length > 1) {
      assert.ok(question.prompt.includes(`${question.correctChoiceIds.length}つ`), question.id)
    }
  }
  for (const domain of ai200.domains) {
    const questions = ai200.questions.filter((question) => question.domainId === domain.id)
    assert.ok(questions.some((question) => question.correctChoiceIds.length === 1), domain.id)
    assert.ok(questions.some((question) => question.correctChoiceIds.length > 1), domain.id)
  }
})

test('AI-200 supports all 600 shuffled questions without duplication, partial credit or bank mutation', () => {
  const original = structuredClone(ai200)
  const session = createSession(ai200, ai200.domains.map((domain) => domain.id), ai200.questions.length, () => 0)
  assert.equal(session.questions.length, 600)
  assert.equal(new Set(session.questions.map((question) => question.id)).size, 600)
  for (const question of session.questions) {
    assert.equal(isCorrect(question, question.correctChoiceIds), true, question.id)
    assert.equal(isCorrect(question, []), false, question.id)
    if (question.correctChoiceIds.length > 1) {
      assert.equal(isCorrect(question, question.correctChoiceIds.slice(1)), false, question.id)
    }
  }
  assert.deepEqual(ai200, original)
})

test('AI-200 domain selection and both answer formats work through grading and completion', () => {
  for (const domain of ai200.domains) {
    const questions = ai200.questions.filter((question) => question.domainId === domain.id)
    for (const multiple of [false, true]) {
      const question = questions.find((item) => (item.correctChoiceIds.length > 1) === multiple)!
      const session = createSession({ ...ai200, questions: [question] }, [domain.id], 10, () => 0.5)
      assert.equal(session.questions.length, 1)
      assert.equal(session.questions[0].domainId, domain.id)
      const finished = nextQuestion(submitAnswer(session, question.correctChoiceIds))
      assert.equal(finished.finished, true)
      assert.deepEqual(getStats(finished), { answered: 1, correct: 1, accuracy: 100 })
    }
  }
})
