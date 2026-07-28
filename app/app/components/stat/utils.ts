import type { SeriesSlug, SeriesSlugSelected, StatTabSlug } from '~/components/stat/types'
import type { WalletId } from '~/components/wallets/types'

import { TrnType } from '~/components/trns/types'

export function getTypesMapping(slug: SeriesSlugSelected | StatTabSlug): TrnType[] {
  // Transfers stay out of charts and period totals (getTotal keeps them in their own buckets,
  // matched by categoryId === 'transfer' so both two-leg and single-leg bank-import rows are
  // covered, and the category breakdown skips system categories). They ARE included in the
  // transaction list under the "all"/summary views so TrnsList's "Transfers" tab works; the
  // expense/income tabs stay pure so drilling into a type never mixes transfers in.
  const typeMapping: Record<SeriesSlugSelected | StatTabSlug, TrnType[]> = {
    expense: [TrnType.Expense],
    income: [TrnType.Income],
    netIncome: [TrnType.Expense, TrnType.Income, TrnType.Transfer],
    split: [TrnType.Expense, TrnType.Income, TrnType.Transfer],
    summary: [TrnType.Expense, TrnType.Income, TrnType.Transfer],
  }

  return typeMapping[slug]
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
): SeriesSlug[] {
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

  if (type && type !== 'netIncome')
    return [type]
  return ['income', 'expense']
}

/**
 * Wallets to render in the header strip: the configured top N, plus any
 * filtered wallet even past that count, so an active filter is never hidden.
 */
export function getSortedFilterWalletsIds(
  filteredIds: WalletId[],
  sortedIds: WalletId[],
  isShow: boolean,
  count: number,
): WalletId[] {
  const showedIds = isShow ? sortedIds.slice(0, count) : filteredIds
  return [...new Set([...showedIds, ...filteredIds])]
}
