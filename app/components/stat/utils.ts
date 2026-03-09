import type { SeriesSlugSelected, StatTabSlug } from '~/components/stat/types'

import { TrnType } from '~/components/trns/types'

export function getTypesMapping(slug: SeriesSlugSelected | StatTabSlug): TrnType[] | undefined {
  const typeMapping: Record<string, TrnType[]> = {
    expense: [TrnType.Expense, TrnType.Transfer],
    income: [TrnType.Income, TrnType.Transfer],
    netIncome: [TrnType.Expense, TrnType.Income, TrnType.Transfer],
    split: [TrnType.Expense, TrnType.Income, TrnType.Transfer],
    summary: [TrnType.Expense, TrnType.Income, TrnType.Transfer],
  }

  return typeMapping[slug] ?? [TrnType.Expense, TrnType.Income, TrnType.Transfer]
}

/**
 * Resolve the selected stat type from tab and user filter.
 */
export function getSelectedType(
  statTab: StatTabSlug,
  filteredType: SeriesSlugSelected,
  type: SeriesSlugSelected | undefined,
): SeriesSlugSelected | StatTabSlug {
  if (statTab === 'summary')
    return filteredType
  if (statTab === 'split')
    return type ?? filteredType
  return statTab
}

/**
 * Resolve the type used for sum display.
 */
export function getSelectedTypeForSum(
  statTab: StatTabSlug,
  type: SeriesSlugSelected | undefined,
): 'summary' | SeriesSlugSelected | StatTabSlug {
  if (statTab === 'summary')
    return 'summary'
  if (statTab === 'split')
    return type ?? 'netIncome'
  return statTab
}

/**
 * Determine which chart series types to render.
 */
export function getTypesToShow(
  statTab: StatTabSlug,
  filteredType: SeriesSlugSelected,
  type: SeriesSlugSelected | undefined,
): string[] {
  if (statTab === 'summary') {
    if (filteredType === 'netIncome')
      return ['income', 'expense']
    if (filteredType === 'income')
      return ['income']
    if (filteredType === 'expense')
      return ['expense']
  }

  if (statTab === 'expense' || statTab === 'income')
    return [statTab]

  return type ? [type] : ['income', 'expense']
}
