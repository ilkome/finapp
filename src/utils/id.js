import moment from 'moment'

function uuid (a, b) { for (b = a = ''; a++ < 36; b += a * 51 & 52 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-');return b }

export const createId = () => {
  return `${moment().format('YY-MM-DD[_]H:mm:ss')}__${uuid()}`
}
