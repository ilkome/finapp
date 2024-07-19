import dayjs from 'dayjs'

import updateLocale from 'dayjs/plugin/updateLocale'
import isBetween from 'dayjs/plugin/isBetween'
import en from 'dayjs/locale/en.js'
import ru from 'dayjs/locale/ru.js'
import calendar from 'dayjs/plugin/calendar'

dayjs.extend(updateLocale)
dayjs.extend(isBetween)
dayjs.extend(calendar)

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
