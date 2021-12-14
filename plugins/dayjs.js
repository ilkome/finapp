import dayjs from 'dayjs'
const updateLocale = require('dayjs/plugin/updateLocale')
const relativeTime = require('dayjs/plugin/relativeTime')
const isoWeek = require('dayjs/plugin/isoWeek')

dayjs.extend(updateLocale)
dayjs.extend(relativeTime)
dayjs.extend(isoWeek)

dayjs.updateLocale('en', {
  weekStart: 1
})

const weekOfYear = require('dayjs/plugin/weekOfYear')
dayjs.extend(weekOfYear)

export default ({ app }, inject) => {
  const locale = require(`dayjs/locale/${app.i18n.locale}.js`)
  dayjs.locale(locale)
  dayjs.updateLocale(locale, {
    weekStart: 1
  })

  inject('day', (val) => {
    if (val) return dayjs(+val)
    return dayjs()
  })
}
