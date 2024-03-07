import type { PeriodName } from '~/components/chart/useChart'

// TODO: move to stat store
export default function usePeriods() {
  const { $i18n } = useNuxtApp()

  const periodsNames = computed<{
    slug: PeriodName
    icon: string
    name: string
  }[]>(() => [{
    slug: 'day',
    icon: 'mdi mdi-weather-sunset-up',
    name: $i18n.t('dates.day.simple'),
  }, {
    slug: 'week',
    icon: 'mdi mdi-calendar-week',
    name: $i18n.t('dates.week.simple'),
  }, {
    slug: 'month',
    icon: 'mdi mdi-calendar',
    name: $i18n.t('dates.month.simple'),
  }, {
    slug: 'year',
    icon: 'mdi mdi-calendar-star',
    name: $i18n.t('dates.year.simple'),
  }])

  return {
    periodsNames,
  }
}
