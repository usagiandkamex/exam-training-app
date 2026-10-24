import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { Exam } from './exam.ts'
import { validateCatalog, validateExam } from './exam.ts'
import { exams } from '../data/catalog.ts'
import demo from '../data/exams/demo.ts'

function certification(): Exam {
  const exam = structuredClone(demo)
  exam.kind = 'certification'
  exam.blueprint = {
    url: 'https://learn.microsoft.com/example-guide',
    reviewedOn: '2026-10-24',
    questionCount: { min: 1, max: 2 },
  }
  exam.usageReview = {
    url: 'https://learn.microsoft.com/example-policy',
    reviewedOn: '2026-10-24',
    notes: 'Test fixture; not a published certification.',
  }
  exam.domains.forEach((domain) => { domain.weight = { min: 50, max: 50 } })
  return exam
}

test('every published bank and the demo pass content validation', () => {
  assert.deepEqual(validateCatalog(exams), [])
  assert.equal(demo.kind, 'demo')
  assert.equal(demo.blueprint, null)
})

test('catalog rejects an empty list and duplicate exam IDs', () => {
  assert.ok(validateCatalog([]).length > 0)
  assert.ok(validateCatalog([demo, demo]).some((error) => error.includes('試験ID')))
})

test('certification requires 5x the maximum official count, not the minimum', () => {
  assert.deepEqual(validateExam(certification()), [])
  const exam = certification()
  exam.blueprint!.questionCount.max = 3
  assert.ok(validateExam(exam).some((error) => error.includes('5倍')))
})

test('certification requires official blueprint and reviewed usage conditions', () => {
  const exam = certification()
  exam.blueprint = null
  exam.usageReview = null
  const errors = validateExam(exam)
  assert.ok(errors.some((error) => error.includes('学習要領')))
  assert.ok(errors.some((error) => error.includes('利用条件')))
})

test('question count metadata and real review dates are checked', () => {
  const exam = certification()
  exam.blueprint!.questionCount = { min: 0, max: 2.5 }
  exam.blueprint!.reviewedOn = '2026-02-30'
  exam.usageReview!.reviewedOn = 'not-a-date'
  assert.ok(validateExam(exam).some((error) => error.includes('問題数の範囲')))
  assert.ok(validateExam(exam).some((error) => error.includes('学習要領')))
  assert.ok(validateExam(exam).some((error) => error.includes('利用条件')))
})

test('certification bank composition must match all official domain ranges', () => {
  const exam = certification()
  exam.questions[0].domainId = 'resilience'
  assert.ok(validateExam(exam).some((error) => error.includes('構成比率')))
  exam.domains[0].weight = null
  assert.ok(validateExam(exam).some((error) => error.includes('分野別出題比率')))
})

test('invalid domain ranges and impossible total percentages are rejected', () => {
  const exam = certification()
  exam.domains[0].weight = { min: 70, max: 60 }
  assert.ok(validateExam(exam).some((error) => error.includes('出題比率が不正')))
  exam.domains.forEach((domain) => { domain.weight = { min: 70, max: 80 } })
  assert.ok(validateExam(exam).some((error) => error.includes('100%')))
})

test('duplicate IDs, unknown domains, invalid answers and blank content are rejected', () => {
  const exam = structuredClone(demo)
  exam.questions[1].id = exam.questions[0].id
  exam.domains[1].id = exam.domains[0].id
  const question = exam.questions[0]
  question.domainId = 'unknown'
  question.choices[1].id = question.choices[0].id
  question.correctChoiceIds = ['unknown', 'unknown']
  question.explanation = ' '
  const errors = validateExam(exam)
  for (const text of ['問題ID', '分野ID', '未定義', '選択肢ID', '正解ID', '解説']) {
    assert.ok(errors.some((error) => error.includes(text)), text)
  }
})

test('empty banks, empty choices, missing sources and all-correct choices are rejected', () => {
  const exam = structuredClone(demo)
  exam.questions[0].choices = []
  exam.questions[1].references = []
  exam.questions[2].correctChoiceIds = exam.questions[2].choices.map((choice) => choice.id)
  const errors = validateExam(exam)
  for (const text of ['選択肢', '参照先', '正解ID']) {
    assert.ok(errors.some((error) => error.includes(text)), text)
  }
  exam.questions = []
  assert.ok(validateExam(exam).some((error) => error.includes('問題が必要')))
})

test('references must use exact allowlisted official HTTPS hosts, without credentials', () => {
  const usernameUrl = new URL('https://learn.microsoft.com/')
  usernameUrl.username = 'example'
  const passwordUrl = new URL('https://learn.microsoft.com/')
  passwordUrl.password = 'example'
  for (const url of [
    'javascript:alert(1)',
    'http://learn.microsoft.com/example',
    'https://learn.microsoft.com.evil.example/',
    'https://evil.example/learn.microsoft.com',
    usernameUrl.toString(),
    passwordUrl.toString(),
    'https://learn.microsoft.com:8443/',
    'not a URL',
  ]) {
    const exam = structuredClone(demo)
    exam.questions[0].references[0].url = url
    assert.ok(validateExam(exam).some((error) => error.includes('公式HTTPS')), url)
  }
})
