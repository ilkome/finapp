import type { Range } from '~~/utils/date/types'

export function resolveStatSelectionRange(range: Range, selectedInterval: Range | undefined, intervalSelected: number): Range {
  return intervalSelected >= 0 ? selectedInterval ?? range : range
}

export function resolveStatSelectionSourceRange(
  range: Range,
  selectedInterval: Range | undefined,
  intervalSelected: number,
  isShowMaxRange: boolean,
): Range | undefined {
  return isShowMaxRange
    ? undefined
    : resolveStatSelectionRange(range, selectedInterval, intervalSelected)
}
