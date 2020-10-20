import dayjs from 'dayjs'
const updateLocale = require('dayjs/plugin/updateLocale')
const relativeTime = require('dayjs/plugin/relativeTime')

dayjs.extend(updateLocale)
dayjs.extend(relativeTime)

dayjs.updateLocale('en', {
  weekStart: 1
})

const weekOfYear = require('dayjs/plugin/weekOfYear')
dayjs.extend(weekOfYear)

export default ({ app }, inject) => {
  const locale = require(`dayjs/locale/${app.i18n.locale}.js`)
  dayjs.locale(locale)

  inject('day', (val) => {
    if (val) { return dayjs(+val) }
    return dayjs()
  })
}
