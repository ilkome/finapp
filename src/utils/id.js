import moment from 'moment'

export const generateDateId = (date) => {
  const string = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  if (date) {
    return `${moment(date).format('YYMMDD[-]HH:mm:ss')}-${string.substring(1, 5)}`
  }
  return `${moment().format('YYMMDD[-]HH:mm:ss')}-${string.substring(1, 5)}`
}

export const generateSimpleId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
