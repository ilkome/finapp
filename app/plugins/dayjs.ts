import dayjs from 'dayjs'

import isBetween from 'dayjs/plugin/isBetween'
import en from 'dayjs/locale/en.js'
import ru from 'dayjs/locale/ru.js'
import calendar from 'dayjs/plugin/calendar'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'

dayjs.extend(isBetween)
dayjs.extend(calendar)
dayjs.extend(isToday)
dayjs.extend(isYesterday)

export default defineNuxtPlugin((nuxtApp) => {
  const locale = nuxtApp.$i18n.locale.value === 'en' ? en : ru
  dayjs.locale({
    ...locale,
    weekStart: 1,
  })

  nuxtApp.provide('day', (val: any) => {
    if (val)
      return dayjs(+val)
    return dayjs()
  })
})
