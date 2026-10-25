import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { exams } from '../src/data/catalog.ts'
import { buildReviewIssue, requestExamReview } from './request-exam-review.mjs'

const now = new Date('2026-10-24T18:23:00Z')
const options = { repository: 'example/exam-app', token: 'not-a-credential', now }
const copilot = { login: 'copilot-swe-agent[bot]' }
const creator = { id: 123, login: 'review-automation' }
const issue = { number: 42, state: 'open', user: creator, assignees: [], body: buildReviewIssue(exams, now).body }

function api(responses) {
  const calls = []
  return {
    calls,
    fetchImpl: async (url, init) => {
      calls.push({ url, ...init, body: init.body ? JSON.parse(init.body) : undefined })
      assert.ok(responses.length > 0, 'Unexpected API call')
      const { data, status = 200 } = responses.shift()
      return new Response(JSON.stringify(data), { status })
    },
  }
}

test('review covers every catalog entry, language, baseline and official source', () => {
  const review = buildReviewIssue(exams, now)
  for (const exam of exams) {
    for (const value of [exam.id, exam.language, exam.description, exam.blueprint.url,
      exam.blueprint.reviewedOn, exam.usageReview.url, exam.usageReview.notes]) {
      assert.ok(review.body.includes(value), value)
    }
    for (const domain of exam.domains) assert.ok(review.body.includes(domain.name))
  }
  const future = { ...exams[0], id: 'future-exam', language: 'en-US' }
  assert.ok(buildReviewIssue([future], now).body.includes('future-exam, 問題言語: en-US'))
  assert.ok(review.body.includes('未確認'))
  assert.ok(review.body.includes('人による内容・権利・正確性レビュー'))
})

test('weekly key changes at Sunday midnight JST, not UTC or on a retry', () => {
  const before = buildReviewIssue(exams, new Date('2026-10-24T14:59:59Z'))
  const after = buildReviewIssue(exams, new Date('2026-10-24T15:00:00Z'))
  const retry = buildReviewIssue(exams, new Date('2026-10-31T14:59:59Z'))
  assert.equal(before.marker, '<!-- weekly-exam-review:2026-10-18 -->')
  assert.equal(after.marker, '<!-- weekly-exam-review:2026-10-25 -->')
  assert.equal(after.since, '2026-10-24T15:00:00.000Z')
  assert.equal(retry.marker, after.marker)
})

test('workflow schedules Sunday early morning JST and isolates the assignment secret', async () => {
  const workflow = await readFile(new URL('../.github/workflows/exam-updates.yml', import.meta.url), 'utf8')
  assert.match(workflow, /cron: '23 18 \* \* 6'/)
  assert.match(workflow, /workflow_dispatch:/)
  assert.match(workflow, /github\.event\.repository\.default_branch/)
  assert.match(workflow, /cancel-in-progress: false/)
  assert.match(workflow, /persist-credentials: false/)
  assert.match(workflow, /node --experimental-strip-types scripts\/request-exam-review\.mjs/)
  assert.match(workflow, /COPILOT_ASSIGNMENT_TOKEN: \$\{\{ secrets\.COPILOT_ASSIGNMENT_TOKEN \}\}/)
  assert.doesNotMatch(workflow, /issues: write|pull-requests: write|npm ci/)
})

test('creates a marked issue and verifies Copilot assignment using the user token', async () => {
  const mock = api([{ data: creator }, { data: [] }, { data: issue }, { data: { ...issue, assignees: [copilot] } }])
  const result = await requestExamReview({ ...options, fetchImpl: mock.fetchImpl })
  assert.deepEqual(result.assignees, [copilot])
  assert.equal(mock.calls.length, 4)
  assert.equal(mock.calls[0].url, 'https://api.github.com/user')
  assert.equal(mock.calls[0].method, 'GET')
  assert.ok(mock.calls[1].url.startsWith(`https://api.github.com/repos/${options.repository}/issues?state=all`))
  assert.equal(mock.calls[2].url, `https://api.github.com/repos/${options.repository}/issues`)
  assert.equal(mock.calls[2].method, 'POST')
  assert.equal(mock.calls[2].body.body, issue.body)
  assert.equal(mock.calls[3].url, `https://api.github.com/repos/${options.repository}/issues/42/assignees`)
  assert.deepEqual(mock.calls[3].body, { assignees: [copilot.login] })
  for (const call of mock.calls) {
    assert.equal(call.headers.Authorization, ['Bearer', options.token].join(' '))
    assert.equal(call.redirect, 'error')
  }
})

test('paginates, ignores pull requests, and does not restart an assigned issue', async () => {
  const first = Array.from({ length: 100 }, () => ({ ...issue, pull_request: {} }))
  const assigned = { ...issue, assignees: [copilot] }
  const mock = api([{ data: creator }, { data: first }, { data: [assigned] }])
  assert.deepEqual(await requestExamReview({ ...options, fetchImpl: mock.fetchImpl }), assigned)
  assert.equal(mock.calls.length, 3)
  assert.match(mock.calls[2].url, /page=2/)
})

test('accepts the returned Copilot login while requesting assignment with the bot login', async () => {
  const assigned = { ...issue, assignees: [{ login: 'Copilot' }] }
  const mock = api([{ data: creator }, { data: [] }, { data: issue }, { data: assigned }])
  assert.deepEqual(await requestExamReview({ ...options, fetchImpl: mock.fetchImpl }), assigned)
  assert.equal(mock.calls.length, 4)
  assert.deepEqual(mock.calls[3].body, { assignees: [copilot.login] })
})

test('does not restart an existing issue assigned to the returned Copilot login', async () => {
  const assigned = { ...issue, assignees: [{ login: 'Copilot' }] }
  const mock = api([{ data: creator }, { data: [assigned] }])
  assert.deepEqual(await requestExamReview({ ...options, fetchImpl: mock.fetchImpl }), assigned)
  assert.equal(mock.calls.length, 2)
})

test('reuses an unassigned issue after a partial failure instead of creating another', async () => {
  const mock = api([{ data: creator }, { data: [issue] }, { data: { ...issue, assignees: [copilot] } }])
  await requestExamReview({ ...options, fetchImpl: mock.fetchImpl })
  assert.equal(mock.calls.length, 3)
  assert.ok(mock.calls[2].url.endsWith('/assignees'))
})

test('closed issues suppress same-week duplicates but last week never blocks a new review', async () => {
  const closed = { ...issue, state: 'closed' }
  const sameWeek = api([{ data: creator }, { data: [closed] }])
  assert.deepEqual(await requestExamReview({ ...options, fetchImpl: sameWeek.fetchImpl }), closed)
  assert.equal(sameWeek.calls.length, 2)
  const previousWeek = { ...issue, body: buildReviewIssue(exams, new Date('2026-10-18T18:23:00Z')).body }
  const nextWeek = api([{ data: creator }, { data: [previousWeek] }, { data: issue }, { data: { ...issue, assignees: [copilot] } }])
  await requestExamReview({ ...options, fetchImpl: nextWeek.fetchImpl })
  assert.equal(nextWeek.calls.length, 4)
})

test('forged open or closed markers and missing authors cannot authorize reuse', async () => {
  for (const state of ['open', 'closed']) {
    for (const user of [{ ...creator, id: 456 }, undefined, null]) {
      const forged = { ...issue, number: 99, state, user }
      const mock = api([
        { data: creator }, { data: [forged] }, { data: issue },
        { data: { ...issue, assignees: [copilot] } },
      ])
      const result = await requestExamReview({ ...options, fetchImpl: mock.fetchImpl })
      assert.equal(result.number, issue.number)
      assert.equal(mock.calls.length, 4)
      assert.equal(mock.calls[2].method, 'POST')
      assert.equal(mock.calls[2].body.body, issue.body)
      assert.ok(mock.calls[3].url.endsWith('/issues/42/assignees'))
    }
  }
})

test('untrusted markers do not hide a trusted issue on a later page', async () => {
  const first = Array.from({ length: 100 }, (_, index) => ({
    ...issue, number: 100 + index, state: index % 2 ? 'closed' : 'open', user: { id: 456 },
  }))
  const mock = api([
    { data: creator }, { data: first }, { data: [issue] },
    { data: { ...issue, assignees: [copilot] } },
  ])
  await requestExamReview({ ...options, fetchImpl: mock.fetchImpl })
  assert.equal(mock.calls.length, 4)
  assert.match(mock.calls[2].url, /page=2/)
  assert.ok(mock.calls[3].url.endsWith('/issues/42/assignees'))
})

test('invalid authenticated identities fail before listing or mutating issues', async () => {
  for (const data of [null, {}, { id: 0 }, { id: -1 }, { id: '123' }, { id: 1.5 },
    { id: Number.MAX_SAFE_INTEGER + 1 }]) {
    const mock = api([{ data }])
    await assert.rejects(requestExamReview({ ...options, fetchImpl: mock.fetchImpl }), /認証ユーザーのID/)
    assert.equal(mock.calls.length, 1)
    assert.equal(mock.calls[0].url, 'https://api.github.com/user')
  }
})

test('missing credentials or an invalid repository fail before any request', async () => {
  const mock = api([])
  await assert.rejects(requestExamReview({ ...options, token: '', fetchImpl: mock.fetchImpl }), /COPILOT_ASSIGNMENT_TOKEN/)
  for (const repository of ['', 'owner/repo/extra', 'owner/..']) {
    await assert.rejects(requestExamReview({ ...options, repository, fetchImpl: mock.fetchImpl }), /GITHUB_REPOSITORY/)
  }
  assert.equal(mock.calls.length, 0)
})

test('API failures at authentication, listing, creation or assignment fail without exposing response bodies', async () => {
  const stages = [
    [],
    [{ data: creator }],
    [{ data: creator }, { data: [] }],
    [{ data: creator }, { data: [] }, { data: issue }],
  ]
  for (const preceding of stages) {
    const mock = api([...preceding, { data: { message: 'sensitive response' }, status: 403 }])
    await assert.rejects(requestExamReview({ ...options, fetchImpl: mock.fetchImpl }), (error) => {
      assert.match(error.message, /HTTP 403/)
      assert.ok(!error.message.includes('sensitive response'))
      assert.ok(!error.message.includes(options.token))
      return true
    })
  }
})

test('silent assignment rejection is a failure even with a successful HTTP response', async () => {
  for (const assignees of [[], [{ login: 'Not-Copilot' }]]) {
    const unassigned = { ...issue, assignees }
    const mock = api([{ data: creator }, { data: [unassigned] }, { data: unassigned }])
    await assert.rejects(requestExamReview({ ...options, fetchImpl: mock.fetchImpl }), /Copilotを割り当てられません/)
    assert.equal(mock.calls.length, 3)
  }
})
