import type { Exam } from '../lib/exam.ts'
import { validateCatalog } from '../lib/exam.ts'
import demo from './exams/demo.ts'
import dp300 from './exams/dp-300.ts'

export const exams: Exam[] = [demo, dp300]

const errors = validateCatalog(exams)
if (errors.length > 0) throw new Error(errors.join('\n'))
