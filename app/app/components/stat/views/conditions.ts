import type { ConditionComparator } from './types'

export function compareCondition(value: number, comparator: ConditionComparator, expected: number): boolean {
  switch (comparator) {
    case '<': return value < expected
    case '<=': return value <= expected
    case '=': return value === expected
    case '!=': return value !== expected
    case '>=': return value >= expected
    case '>': return value > expected
  }
}
