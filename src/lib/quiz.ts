import type { Exam, Question } from './exam.ts'

export interface Session {
  questions: Question[]
  index: number
  answers: { questionId: string; selectedIds: string[]; correct: boolean }[]
  finished: boolean
}

export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1))
    ;[result[index], result[target]] = [result[target], result[index]]
  }
  return result
}

export function createSession(
  exam: Exam,
  domainIds: string[],
  limit: number,
  random = Math.random,
): Session {
  const pool = exam.questions.filter((question) => domainIds.includes(question.domainId))
  if (pool.length === 0 || !Number.isInteger(limit) || limit <= 0) {
    throw new Error('出題できる分野と問題数を選択してください')
  }
  return {
    questions: shuffle(pool, random).slice(0, limit).map((question) => ({
      ...question,
      choices: shuffle(question.choices, random),
    })),
    index: 0,
    answers: [],
    finished: false,
  }
}

export function isCorrect(question: Question, selectedIds: string[]): boolean {
  return new Set(selectedIds).size === selectedIds.length &&
    selectedIds.length === question.correctChoiceIds.length &&
    question.correctChoiceIds.every((id) => selectedIds.includes(id))
}

export function submitAnswer(session: Session, selectedIds: string[]): Session {
  const question = session.questions[session.index]
  if (session.finished || session.answers.some((answer) => answer.questionId === question.id) ||
    selectedIds.length !== question.correctChoiceIds.length ||
    new Set(selectedIds).size !== selectedIds.length ||
    selectedIds.some((id) => !question.choices.some((choice) => choice.id === id))) {
    return session
  }
  return {
    ...session,
    answers: [...session.answers, {
      questionId: question.id,
      selectedIds: [...selectedIds],
      correct: isCorrect(question, selectedIds),
    }],
  }
}

export function nextQuestion(session: Session): Session {
  if (session.finished || session.answers.length !== session.index + 1) return session
  if (session.index === session.questions.length - 1) return { ...session, finished: true }
  return { ...session, index: session.index + 1 }
}

export function getStats(session: Session) {
  const answered = session.answers.length
  const correct = session.answers.filter((answer) => answer.correct).length
  return { answered, correct, accuracy: answered === 0 ? null : Math.round(correct / answered * 100) }
}
