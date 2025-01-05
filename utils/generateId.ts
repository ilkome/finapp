import { format } from 'date-fns'

export function generateId() {
  const st = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  return `${format(new Date(), 'yyMMdd')}_${st.slice(0, 6)}`
}
