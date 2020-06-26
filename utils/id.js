import dayjs from 'dayjs'

export default function (date) {
  const string = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  return `${dayjs(date).format('YYMMDD')}_${string.slice(0, 6)}`
}
