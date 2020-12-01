import dayjs from 'dayjs'

export const state = () => ({
  categoryId: null,
  walletId: null,
  date: dayjs().valueOf(),
  period: 'month'
})
