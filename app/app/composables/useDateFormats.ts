import type { TrnDateParts } from '~~/utils/date/labels'

import { formatTrnDateLabel } from '~~/utils/date/labels'

export function useDateFormats() {
  const { locale, t } = useI18n()

  function formatDate(value: number, type: 'trnItem'): string | undefined
  function formatDate(value: number, type: 'full'): TrnDateParts | undefined
  function formatDate(value: number, type: 'trnItem' | 'full'): string | TrnDateParts | undefined {
    return formatTrnDateLabel(value, type, t, locale.value)
  }

  return {
    formatDate,
  }
}
