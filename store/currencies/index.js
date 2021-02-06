import dayjs from 'dayjs'

export const state = () => ({
  amountSeparator: ' ',
  base: 'RUB',
  date: dayjs().valueOf(),
  rates: {},
  modal: {
    show: false
  }
})
