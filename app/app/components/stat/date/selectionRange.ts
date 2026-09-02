import type { Range } from '~~/utils/date/types'

export function resolveStatSelectionRange(range: Range, selectedInterval: Range | undefined, intervalSelected: number): Range {
  return intervalSelected >= 0 ? selectedInterval ?? range : range
}
