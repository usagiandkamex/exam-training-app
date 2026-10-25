import { useEffect, useRef, useState } from 'react'
import {
  Badge, Button, Card, Checkbox, Dialog, DialogActions, DialogBody, DialogContent,
  DialogSurface, DialogTitle, DialogTrigger, Field, Link, MessageBar, MessageBarBody,
  ProgressBar, Radio, RadioGroup, Select,
} from '@fluentui/react-components'
import { exams } from './data/catalog.ts'
import type { Exam, Question } from './lib/exam.ts'
import { createSession, getStats, nextQuestion, submitAnswer } from './lib/quiz.ts'
import type { Session } from './lib/quiz.ts'
import { ContentPolicy } from './components/ContentPolicy.tsx'

const requestUrl = 'https://github.com/usagiandkamex/exam-training-app/issues/new?template=exam-request.yml'

function ExamBadge({ exam }: { exam: Exam }) {
  return <Badge appearance="tint" color={exam.kind === 'demo' ? 'warning' : 'brand'}>
    {exam.kind === 'demo' ? '体験デモ · 正式試験ではありません' : '独自作問 · 非公式'}
  </Badge>
}

function Setup({ onStart }: { onStart: (exam: Exam, domains: string[], limit: number) => void }) {
  const [examId, setExamId] = useState(exams[0].id)
  const exam = exams.find((item) => item.id === examId)!
  const [domains, setDomains] = useState(exam.domains.map((domain) => domain.id))
  const [limit, setLimit] = useState('10')
  const available = exam.questions.filter((question) => domains.includes(question.domainId)).length
  const count = limit === 'all' ? available : Math.min(Number(limit), available)

  return <>
    <div className="hero">
      <p className="eyebrow">ひとつずつ解いて、理解を積み重ねる</p>
      <h1 id="page-title">今日の一問が、<br />確かな知識に。</h1>
      <p>分野を選んで、自分のペースで。回答のたびに解説と公式資料で振り返れます。</p>
    </div>
    <div className="setup-grid">
      <Card className="setup-card">
        <div className="section-heading"><span className="step-number" aria-hidden="true">01</span><h2>学習をはじめる</h2></div>
        <Field label="試験・問題集" required>
          <Select value={examId} onChange={(_, data) => {
            const next = exams.find((item) => item.id === data.value)!
            setExamId(next.id)
            setDomains(next.domains.map((domain) => domain.id))
          }}>
            {exams.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </Select>
        </Field>
        <ExamBadge exam={exam} />
        <p className="muted">{exam.description}</p>
        <fieldset>
          <legend>分野指定</legend>
          <p className="field-help">複数選択できます。選んだ分野からランダムに出題します。</p>
          <div className="domain-actions">
            <Button size="small" appearance="subtle" onClick={() => setDomains(exam.domains.map((domain) => domain.id))}>すべて選択</Button>
            <Button size="small" appearance="subtle" onClick={() => setDomains([])}>選択を解除</Button>
          </div>
          <div className="domain-list">
            {exam.domains.map((domain) => <Checkbox key={domain.id}
              checked={domains.includes(domain.id)}
              onChange={(_, data) => setDomains((current) => data.checked
                ? [...current, domain.id] : current.filter((id) => id !== domain.id))}
              label={`${domain.name}（${exam.questions.filter((question) => question.domainId === domain.id).length}問）`}
            />)}
          </div>
        </fieldset>
        <Field label="今回の出題数" hint="対象が指定数より少ない場合は、対象の全問を出題します。">
          <Select value={limit} onChange={(_, data) => setLimit(data.value)}>
            <option value="10">10問</option><option value="20">20問</option><option value="all">対象の全問</option>
          </Select>
        </Field>
        <div className="start-summary" role="status">
          {available > 0 ? <>対象 {available}問から <strong>{count}問</strong>を出題</> : '分野を1つ以上選択してください'}
        </div>
        <Button appearance="primary" size="large" disabled={count === 0}
          onClick={() => onStart(exam, domains, count)}>学習を開始する</Button>
        <p className="field-help">学習用のランダム出題です。本番の出題比率を再現する模擬試験ではありません。</p>
      </Card>
      <aside className="guide-stack" aria-label="学習ガイド">
        <Card className="guide-card">
          <p className="eyebrow">HOW TO LEARN</p>
          <h2>解くだけで終わらない学習を</h2>
          <ol className="steps">
            <li><strong>分野を選ぶ</strong><span>すべてを通しても、苦手な分野だけでも。</span></li>
            <li><strong>1問ずつ考える</strong><span>回答を確定すると、正解と解説を表示します。</span></li>
            <li><strong>根拠まで理解する</strong><span>公式資料へのリンクで、理解を深めましょう。</span></li>
          </ol>
        </Card>
        <Card className="guide-card upcoming">
          <Badge appearance="outline">試験はリクエストに応じて追加</Badge>
          <h2>次に学びたい試験は？</h2>
          <p>Azure・AWS・CISSPなど、追加したい試験をGitHubのissueでお知らせください。</p>
          <p className="muted">DP-300の非公式問題集と、操作を試せる体験デモを公開しています。</p>
          <Link href={requestUrl} target="_blank" rel="noopener noreferrer">試験の追加をリクエスト（別タブ） →</Link>
        </Card>
        {exam.blueprint && <Card className="guide-card">
          <h2>問題集の根拠</h2>
          <p>収録 {exam.questions.length}問 / 問題数の目安 {exam.blueprint.questionCount.min}〜{exam.blueprint.questionCount.max}問</p>
          <p>学習要領確認日：{exam.blueprint.reviewedOn}</p>
          <ul>{exam.domains.map((domain) => <li key={domain.id}>{domain.name}：{domain.weight?.min}〜{domain.weight?.max}%</li>)}</ul>
          <Link href={exam.blueprint.url} target="_blank" rel="noopener noreferrer">公式の学習要領（別タブ）</Link>
          {exam.usageReview && <Link href={exam.usageReview.url} target="_blank" rel="noopener noreferrer">利用条件（確認日：{exam.usageReview.reviewedOn}・別タブ）</Link>}
        </Card>}
      </aside>
    </div>
  </>
}

function Stats({ session }: { session: Session }) {
  const stats = getStats(session)
  return <div className="stats-grid" aria-label="学習状況">
    <div><span>回答済み</span><strong>{stats.answered}<small> / {session.questions.length}問</small></strong></div>
    <div><span>正解数</span><strong>{stats.correct}<small>問</small></strong></div>
    <div><span>正答率</span><strong>{stats.accuracy === null ? '—' : `${stats.accuracy}%`}</strong></div>
  </div>
}

function Explanation({ question }: { question: Question }) {
  return <div className="explanation">
    <h3>正解</h3>
    <ul>{question.choices.filter((choice) => question.correctChoiceIds.includes(choice.id))
      .map((choice) => <li key={choice.id}>{choice.text}</li>)}</ul>
    <h3>解説</h3>
    <p>{question.explanation}</p>
    <h3>公式資料で確認</h3>
    <ul className="reference-list">{question.references.map((ref) => <li key={ref.url}>
      <Link href={ref.url} target="_blank" rel="noopener noreferrer">{ref.title}（別タブ） ↗</Link>
    </li>)}</ul>
  </div>
}

function Quiz({ exam, session, onAnswer, onNext }: {
  exam: Exam; session: Session; onAnswer: (ids: string[]) => void; onNext: () => void
}) {
  const [selected, setSelected] = useState<string[]>([])
  const heading = useRef<HTMLHeadingElement>(null)
  const feedback = useRef<HTMLDivElement>(null)
  const question = session.questions[session.index]
  const answer = session.answers.find((item) => item.questionId === question.id)
  const multiple = question.correctChoiceIds.length > 1
  useEffect(() => { heading.current?.focus() }, [])
  useEffect(() => { if (answer) feedback.current?.focus() }, [answer])

  return <div className="quiz-shell">
    <div className="quiz-topline"><div><p className="eyebrow">{exam.title}</p><ExamBadge exam={exam} /></div>
      <DialogTrigger disableButtonEnhancement><Button appearance="subtle">学習を終了</Button></DialogTrigger>
    </div>
    <Stats session={session} />
    <ProgressBar value={session.answers.length} max={session.questions.length} aria-label="回答の進捗" />
    <Card className="question-card">
      <div className="question-meta">
        <span>第 {session.index + 1} 問 / 全 {session.questions.length} 問</span>
        <Badge appearance="tint">{exam.domains.find((domain) => domain.id === question.domainId)!.name}</Badge>
      </div>
      <h1 ref={heading} tabIndex={-1} className="question-title">{question.prompt}</h1>
      <p id="answer-hint" className="field-help">
        {multiple ? `${question.correctChoiceIds.length}つ選択してください（すべて一致で正解・部分点なし）。` : '最も適切なものを1つ選択してください。'}
      </p>
      <form onSubmit={(event) => { event.preventDefault(); onAnswer(selected) }}>
        <fieldset disabled={Boolean(answer)} aria-describedby="answer-hint">
          <legend className="sr-only">回答の選択肢</legend>
          {multiple ? <div className="choices">{question.choices.map((choice, index) =>
            <div key={choice.id} className={`choice ${answer && question.correctChoiceIds.includes(choice.id) ? 'is-correct' : ''} ${answer && selected.includes(choice.id) && !question.correctChoiceIds.includes(choice.id) ? 'is-wrong' : ''}`}>
              <Checkbox checked={selected.includes(choice.id)} disabled={Boolean(answer)}
                label={`${index + 1}. ${choice.text}`}
                onChange={(_, data) => setSelected((current) => data.checked ? [...current, choice.id] : current.filter((id) => id !== choice.id))} />
              {answer && question.correctChoiceIds.includes(choice.id) && <span className="answer-marker">✓ 正解</span>}
              {answer && selected.includes(choice.id) && !question.correctChoiceIds.includes(choice.id) && <span className="wrong-marker">✕ 選択した回答</span>}
            </div>)}</div> :
            <RadioGroup className="choices" value={selected[0] ?? ''} onChange={(_, data) => setSelected([data.value])}>
              {question.choices.map((choice, index) => <div key={choice.id}
                className={`choice ${answer && question.correctChoiceIds.includes(choice.id) ? 'is-correct' : ''} ${answer && selected.includes(choice.id) && !question.correctChoiceIds.includes(choice.id) ? 'is-wrong' : ''}`}>
                <Radio value={choice.id} label={`${index + 1}. ${choice.text}`} disabled={Boolean(answer)} />
                {answer && question.correctChoiceIds.includes(choice.id) && <span className="answer-marker">✓ 正解</span>}
                {answer && selected.includes(choice.id) && !question.correctChoiceIds.includes(choice.id) && <span className="wrong-marker">✕ 選択した回答</span>}
              </div>)}
            </RadioGroup>}
        </fieldset>
        {!answer && <div className="answer-actions">
          <span className="field-help" role="status">{selected.length} / {question.correctChoiceIds.length} 個を選択</span>
          <Button type="submit" appearance="primary" size="large"
            disabled={selected.length !== question.correctChoiceIds.length}>回答を確定する</Button>
        </div>}
      </form>
      <div aria-live="polite" aria-atomic="true">
        {answer && <div ref={feedback} tabIndex={-1} className="feedback">
          <MessageBar intent={answer.correct ? 'success' : 'error'}>
            <MessageBarBody><strong>{answer.correct ? '正解です！' : '不正解です。解説を確認しましょう。'}</strong></MessageBarBody>
          </MessageBar>
          <Explanation question={question} />
        </div>}
      </div>
      {answer && <Button appearance="primary" size="large" className="next-button" onClick={onNext}>
        {session.index === session.questions.length - 1 ? '結果を見る' : '次の問題へ →'}
      </Button>}
    </Card>
  </div>
}

function Results({ exam, session, onRestart, onReset }: {
  exam: Exam; session: Session; onRestart: () => void; onReset: () => void
}) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => { heading.current?.focus() }, [])
  return <div className="quiz-shell">
    <div className="results-heading">
      <p className="eyebrow">SESSION COMPLETE</p><ExamBadge exam={exam} />
      <h1 ref={heading} tabIndex={-1}>おつかれさまでした！</h1>
      <p>{exam.title} · {session.questions.length}問の学習が完了しました。</p>
    </div>
    <Stats session={session} />
    <Card className="result-card">
      <h2>分野別の振り返り</h2>
      <p className="muted">今回回答した問題に対する正答率です。本番の合否を判定するものではありません。</p>
      {exam.domains.map((domain) => {
        const ids = session.questions.filter((question) => question.domainId === domain.id).map((question) => question.id)
        const answers = session.answers.filter((answer) => ids.includes(answer.questionId))
        if (answers.length === 0) return null
        const correct = answers.filter((answer) => answer.correct).length
        return <div className="domain-result" key={domain.id}><span>{domain.name}</span>
          <strong>{correct} / {answers.length}問（{Math.round(correct / answers.length * 100)}%）</strong></div>
      })}
      <div className="button-row"><Button appearance="primary" size="large" onClick={onRestart}>同じ条件でもう一度</Button>
        <Button size="large" onClick={onReset}>試験・分野を選び直す</Button></div>
    </Card>
    {session.answers.some((answer) => !answer.correct) && <Card className="result-card">
      <h2>間違えた問題を復習</h2>
      {session.questions.filter((question) => session.answers.some((answer) => answer.questionId === question.id && !answer.correct))
        .map((question) => <details key={question.id} className="review-question">
          <summary>{question.prompt}</summary><Explanation question={question} />
        </details>)}
    </Card>}
  </div>
}

export default function App() {
  const [practice, setPractice] = useState<{ exam: Exam; domains: string[]; limit: number; session: Session } | null>(null)
  const homeHeading = useRef<HTMLElement>(null)
  function reset() {
    setPractice(null)
    requestAnimationFrame(() => homeHeading.current?.focus())
  }

  // Keep the dialog mounted across screen changes so focus isolation is released.
  return <Dialog inertTrapFocus><div className="app-shell">
    <a className="skip-link" href="#main">本文へスキップ</a>
    <header className="site-header">
      <a className="brand" href="#main" onClick={(event) => {
        if (practice) { event.preventDefault(); document.getElementById('main')?.focus() }
      }}><span className="brand-mark" aria-hidden="true">学</span><span>試験対策ラボ</span></a>
      <nav aria-label="メインナビゲーション"><a href="#content-policy">公開方針</a>
        <a href={requestUrl} target="_blank" rel="noopener noreferrer">試験リクエスト ↗<span className="sr-only">（別タブ）</span></a></nav>
    </header>
    <main id="main" tabIndex={-1} ref={homeHeading}>
      {!practice ? <Setup onStart={(exam, domains, limit) => setPractice({
        exam, domains, limit, session: createSession(exam, domains, limit),
      })} /> : practice.session.finished ? <Results exam={practice.exam} session={practice.session}
        onReset={reset} onRestart={() => setPractice((current) => current && ({
          ...current, session: createSession(current.exam, current.domains, current.limit),
        }))} /> : <Quiz key={practice.session.questions[practice.session.index].id}
        exam={practice.exam} session={practice.session}
        onAnswer={(ids) => setPractice((current) => current && ({ ...current, session: submitAnswer(current.session, ids) }))}
        onNext={() => setPractice((current) => current && ({ ...current, session: nextQuestion(current.session) }))} />}
    </main>
    <ContentPolicy />
    <footer className="site-footer"><span>試験対策ラボ · 非公式の学習支援アプリ</span>
      <Link href="https://github.com/usagiandkamex/exam-training-app" target="_blank" rel="noopener noreferrer">GitHub（別タブ） ↗</Link></footer>
  </div>
    <DialogSurface>
      <DialogBody>
        <DialogTitle>学習を終了しますか？</DialogTitle>
        <DialogContent>選択画面に戻ります。現在の回答は保存されません。</DialogContent>
        <DialogActions>
          <DialogTrigger disableButtonEnhancement><Button>学習を続ける</Button></DialogTrigger>
          <DialogTrigger disableButtonEnhancement><Button appearance="primary" onClick={reset}>終了して戻る</Button></DialogTrigger>
        </DialogActions>
      </DialogBody>
    </DialogSurface>
  </Dialog>
}
