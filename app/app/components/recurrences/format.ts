import type { RecurrenceFreq } from '~/components/recurrences/types'

export function recurrenceEveryLabel(
  t: (key: string, choice?: number) => string,
  freq: RecurrenceFreq,
  interval: number,
): string {
  return interval === 1
    ? t(`recurrences.everyOne.${freq}`)
    : `${t('recurrences.form.every')} ${interval} ${t(`recurrences.unit.${freq}`, interval)}`
}
