import dayjs from 'dayjs'

export const state = () => ({
  base: 'RUB',
  date: dayjs().valueOf(),
  rates: {},
  modal: {
    show: false
  }
})
