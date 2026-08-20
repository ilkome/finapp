import type { SeriesSlug, SeriesSlugSelected, StatReportType } from '~/components/stat/types'
import type { WalletId } from '~/components/wallets/types'

import { TrnType } from '~/components/trns/types'

export function getTypesMapping(slug: SeriesSlugSelected | StatReportType): TrnType[] {
  // Transfers stay out of charts and period totals (getTotal keeps them in their own buckets,
  // matched by categoryId === 'transfer' so both two-leg and single-leg bank-import rows are
  // covered, and the category breakdown skips system categories). They ARE included in the
  // transaction list under the "all"/summary views so TrnsList's "Transfers" tab works; the
  // expense/income tabs stay pure so drilling into a type never mixes transfers in.
  const typeMapping: Record<SeriesSlugSelected | StatReportType, TrnType[]> = {
    combined: [TrnType.Expense, TrnType.Income, TrnType.Transfer],
    expense: [TrnType.Expense],
    income: [TrnType.Income],
    net: [TrnType.Expense, TrnType.Income, TrnType.Transfer],
  }

  return typeMapping[slug]
}

/**
 * Resolve the selected stat type from the report projection and user filter.
 */
export function getSelectedType(
  reportType: StatReportType,
  filteredType: SeriesSlugSelected,
  _type: SeriesSlugSelected | undefined,
): SeriesSlugSelected | StatReportType {
  if (reportType === 'combined')
    return filteredType
  return reportType
}

/**
 * Resolve the type used for total display.
 */
export function getSelectedTypeForSum(
  reportType: StatReportType,
  _type: SeriesSlugSelected | undefined,
): 'summary' | SeriesSlugSelected {
  if (reportType === 'combined')
    return 'summary'
  return reportType
}

/**
 * Determine which chart series types to render.
 */
export function getTypesToShow(
  reportType: StatReportType,
  filteredType: SeriesSlugSelected,
  type: SeriesSlugSelected | undefined,
): SeriesSlug[] {
  if (reportType === 'combined') {
    if (filteredType === 'net')
      return ['income', 'expense']
    if (filteredType === 'income')
      return ['income']
    if (filteredType === 'expense')
      return ['expense']
  }

  if (reportType === 'expense' || reportType === 'income')
    return [reportType]

  if (type && type !== 'net')
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
