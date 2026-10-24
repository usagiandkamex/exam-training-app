import type { Exam } from '../lib/exam.ts'
import { validateCatalog } from '../lib/exam.ts'
import demo from './exams/demo.ts'

export const exams: Exam[] = [demo]

const errors = validateCatalog(exams)
if (errors.length > 0) throw new Error(errors.join('\n'))
