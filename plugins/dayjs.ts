import dayjs from 'dayjs'

import updateLocale from 'dayjs/plugin/updateLocale'
import relativeTime from 'dayjs/plugin/relativeTime'
import isoWeek from 'dayjs/plugin/isoWeek'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import locale from 'dayjs/locale/en.js'
import calendar from 'dayjs/plugin/calendar'

dayjs.extend(updateLocale)
dayjs.extend(relativeTime)
dayjs.extend(isoWeek)
dayjs.extend(weekOfYear)
dayjs.extend(calendar)

export default defineNuxtPlugin((nuxtApp) => {
  dayjs.locale(locale)
  dayjs.updateLocale(locale, {
    weekStart: 1,
  })

  nuxtApp.provide('day', (val) => {
    if (val)
      return dayjs(+val)
    return dayjs()
  })
})
