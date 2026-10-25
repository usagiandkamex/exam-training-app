import type { Exam } from '../lib/exam.ts'
import { validateCatalog } from '../lib/exam.ts'
import dp300 from './exams/dp-300.ts'
import ai200 from './exams/ai-200.ts'

export const exams: Exam[] = [dp300, ai200]

const errors = validateCatalog(exams)
if (errors.length > 0) throw new Error(errors.join('\n'))
