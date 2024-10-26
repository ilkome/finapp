import dayjs from 'dayjs'

export function generateId() {
  const st = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  return `${dayjs().format('YYMMDD')}_${st.slice(0, 6)}`
}
