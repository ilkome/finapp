import type { TrnDateParts } from '~~/utils/date/labels'

import { formatTrnDateLabel } from '~~/utils/date/labels'

export function useDateFormats() {
  const { t } = useI18n()
  const dateLocale = useDateLocale()

  function formatDate(value: number, type: 'trnItem'): string | undefined
  function formatDate(value: number, type: 'full'): TrnDateParts | undefined
  function formatDate(value: number, type: 'trnItem' | 'full'): string | TrnDateParts | undefined {
    return formatTrnDateLabel(value, type, t, dateLocale.value)
  }

  return {
    formatDate,
  }
}
