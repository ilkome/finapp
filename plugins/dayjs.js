import dayjs from 'dayjs'
const updateLocale = require('dayjs/plugin/updateLocale')
dayjs.extend(updateLocale)

dayjs.updateLocale('en', {
  weekStart: 1
})

const weekOfYear = require('dayjs/plugin/weekOfYear')
dayjs.extend(weekOfYear)

export default (ctx, inject) => {
  inject('day', (val) => {
    if (val) { return dayjs(+val) }
    return dayjs()
  })
}
