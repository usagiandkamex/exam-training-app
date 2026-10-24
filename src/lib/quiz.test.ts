import { test } from 'node:test'
import assert from 'node:assert/strict'
import demo from '../data/exams/demo.ts'
import { createSession, getStats, isCorrect, nextQuestion, shuffle, submitAnswer } from './quiz.ts'

test('shuffle preserves input and all items, with deterministic random injection', () => {
  const original = [1, 2, 3, 4]
  assert.deepEqual(shuffle(original, () => 0), [2, 3, 4, 1])
  assert.deepEqual(original, [1, 2, 3, 4])
  assert.deepEqual(shuffle([], () => 0), [])
  assert.deepEqual(shuffle([1]), [1])
})

test('session filters domains, limits questions, and shuffles choices without mutating the bank', () => {
  const original = structuredClone(demo)
  const session = createSession(demo, ['identity'], 3, () => 0)
  assert.equal(session.questions.length, 3)
  assert.ok(session.questions.every((question) => question.domainId === 'identity'))
  assert.equal(new Set(session.questions.map((question) => question.id)).size, 3)
  assert.deepEqual(demo, original)
  assert.deepEqual(getStats(session), { answered: 0, correct: 0, accuracy: null })
  assert.equal(createSession(demo, ['identity'], 100).questions.length, 5)
})

test('invalid or empty sessions cannot start', () => {
  for (const limit of [0, -1, NaN, Infinity, 1.5]) {
    assert.throws(() => createSession(demo, ['identity'], limit))
  }
  assert.throws(() => createSession(demo, [], 10))
  assert.throws(() => createSession(demo, ['unknown'], 10))
})

test('multiple answers use exact unordered ID matching, with no partial credit', () => {
  const question = demo.questions.find((question) => question.correctChoiceIds.length === 2)!
  assert.equal(isCorrect(question, [...question.correctChoiceIds].reverse()), true)
  assert.equal(isCorrect(question, [question.correctChoiceIds[0]]), false)
  assert.equal(isCorrect(question, [...question.correctChoiceIds, 'unknown']), false)
  assert.equal(isCorrect(question, [question.correctChoiceIds[0], question.correctChoiceIds[0]]), false)
})

test('unanswered questions cannot be skipped and invalid answers are not graded', () => {
  const session = createSession(demo, ['identity'], 1, () => 0)
  assert.equal(nextQuestion(session), session)
  for (const answer of [[], ['unknown'], ['a', 'a'], ['a', 'b', 'c', 'd']]) {
    assert.equal(submitAnswer(session, answer), session)
  }
})

test('grading is immutable and idempotent; finished sessions cannot be changed', () => {
  const session = createSession(demo, ['identity', 'resilience'], 1)
  const ids = [...session.questions[0].correctChoiceIds]
  const graded = submitAnswer(session, ids)
  ids[0] = 'changed'
  assert.equal(session.answers.length, 0)
  assert.equal(graded.answers.length, 1)
  assert.equal(graded.answers[0].correct, true)
  assert.equal(submitAnswer(graded, []), graded)
  assert.equal(submitAnswer(graded, graded.questions[0].correctChoiceIds), graded)
  const finished = nextQuestion(graded)
  assert.equal(finished.finished, true)
  assert.equal(submitAnswer(finished, []), finished)
  assert.equal(nextQuestion(finished), finished)
})

test('progress and accuracy count only submitted answers and persist on next question', () => {
  let session = createSession(demo, ['identity'], 3, () => 0)
  session = submitAnswer(session, session.questions[0].correctChoiceIds)
  assert.deepEqual(getStats(session), { answered: 1, correct: 1, accuracy: 100 })
  session = nextQuestion(session)
  assert.equal(session.index, 1)
  assert.deepEqual(getStats(session), { answered: 1, correct: 1, accuracy: 100 })
  const question = session.questions[1]
  const wrong = question.choices.filter((choice) => !question.correctChoiceIds.includes(choice.id))
    .slice(0, question.correctChoiceIds.length).map((choice) => choice.id)
  session = submitAnswer(session, wrong)
  assert.deepEqual(getStats(session), { answered: 2, correct: 1, accuracy: 50 })
  session = nextQuestion(session)
  session = submitAnswer(session, session.questions[2].correctChoiceIds)
  assert.deepEqual(getStats(session), { answered: 3, correct: 2, accuracy: 67 })
  assert.equal(nextQuestion(session).finished, true)
})
