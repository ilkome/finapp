import dayjs from 'dayjs'

export const state = () => ({
  walletsIds: [],
  catsIds: [],
  date: dayjs().startOf('month').valueOf(),
  period: 'month',
})
