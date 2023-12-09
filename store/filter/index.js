import dayjs from 'dayjs'

export function state() {
  return {
    walletsIds: [],
    catsIds: [],
    date: dayjs().startOf('month').valueOf(),
    period: 'month',
  }
}
