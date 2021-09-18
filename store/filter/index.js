import dayjs from 'dayjs'

export const state = () => ({
  categoryId: null,
  walletId: null,
  date: dayjs().startOf('month').valueOf(),
  period: 'month'
})
