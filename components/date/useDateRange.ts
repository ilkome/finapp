import dayjs from 'dayjs'
import { useStorage } from '@vueuse/core'
import type { GroupBy, Period, Range, RangeDuration } from '~/components/date/types'
import { formatDate } from '~/components/date/format'

export function useDateRange({ key }: { key: string }) {
  const { t } = useI18n()

  const period = useStorage<Period>(`${key}-period`, 'month')
  const groupBy = ref<GroupBy>('period')
  const duration = useStorage<number>(`${key}-duration`, 24)
  const range = ref({
    end: dayjs().endOf(period.value).valueOf(),
    start: dayjs().subtract(duration.value, period.value).startOf(period.value).valueOf(),
  })
  const initialRange = ref({ ...range.value })
  const date = computed(() => groupBy.value === 'all' ? t('dates.all.simple') : formatDate(range.value))

  function setRange(r: Range) {
    range.value = { ...r }
  }

  function setRangeByPeriod(r: RangeDuration) {
    if (r.groupBy === 'all') {
      groupBy.value = 'all'
      return
    }

    groupBy.value = r.groupBy
    period.value = r.period ?? 'day'
    duration.value = r.duration === 0 ? 0 : r.duration - 1
    range.value = {
      end: dayjs().endOf(period.value).valueOf(),
      start: dayjs().subtract(duration.value, period.value).startOf(period.value).valueOf(),
    }
  }

  function setRangeByCalendar(r: Range) {
    groupBy.value = 'daySelector'
    period.value = 'day'

    const newRange = {
      end: dayjs(r.end).endOf(period.value).valueOf(),
      start: dayjs(r.start).startOf(period.value).valueOf(),
    }

    initialRange.value = { ...newRange }
    range.value = { ...newRange }
  }

  return {
    date,
    duration,
    groupBy,
    initialRange,
    period,
    range,

    setRange,
    setRangeByCalendar,
    setRangeByPeriod,
  }
}
