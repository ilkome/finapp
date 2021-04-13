import { ref, computed, useContext } from '@nuxtjs/composition-api'

export default function usePeriods () {
  const { store, app: { i18n } } = useContext()

  const periodsNames = computed(() => [
    {
      slug: 'day',
      icon: 'mdi mdi-weather-sunset-up',
      name: i18n.t('dates.day.simple')
    }, {
      slug: 'week',
      icon: 'mdi mdi-calendar-week',
      name: i18n.t('dates.week.simple')
    }, {
      slug: 'month',
      icon: 'mdi mdi-calendar',
      name: i18n.t('dates.month.simple')
    }, {
      slug: 'year',
      icon: 'mdi mdi-calendar-star',
      name: i18n.t('dates.year.simple')
    }
  ])

  return {
    periodsNames
  }
}
