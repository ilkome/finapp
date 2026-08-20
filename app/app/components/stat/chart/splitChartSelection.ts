import type { SeriesSlug, SeriesSlugSelected } from '~/components/stat/types'

export type SplitChartSelectionState = {
  activeIntervalKey?: number
  activeType?: SeriesSlug
  previousType?: SeriesSlugSelected
}

export function resolveSplitChartSelection(
  currentType: SeriesSlugSelected,
  clickedType: SeriesSlug,
  intervalKey: number | undefined,
  state: SplitChartSelectionState,
): { nextType: SeriesSlugSelected, state: SplitChartSelectionState } {
  if (
    state.activeType === clickedType
    && state.activeIntervalKey === intervalKey
    && currentType === clickedType
    && state.previousType
  ) {
    return {
      nextType: state.previousType,
      state: {},
    }
  }

  return {
    nextType: clickedType,
    state: {
      activeIntervalKey: intervalKey,
      activeType: clickedType,
      previousType: state.activeType === clickedType && currentType === clickedType
        ? state.previousType ?? currentType
        : currentType,
    },
  }
}
