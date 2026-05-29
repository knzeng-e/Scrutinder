import type { Measure, ProgramChapter } from '@/types'
import measuresJson from '@/data/measures.json'
import programJson from '@/data/program.json'

export const measures: Measure[] = measuresJson as Measure[]
export const program: ProgramChapter[] = programJson as ProgramChapter[]

export function getMeasureById(id: number): Measure | undefined {
  return measures.find((m) => m.id === id)
}
