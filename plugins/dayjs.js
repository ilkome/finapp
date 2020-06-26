import dayjs from 'dayjs'
const weekOfYear = require('dayjs/plugin/weekOfYear')
dayjs.extend(weekOfYear)

export default (ctx, inject) => {
  inject('day', (val) => {
    if (val) { return dayjs(+val) }
    return dayjs()
  })
}
