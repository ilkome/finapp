export const periods = ['day', 'week', 'month', 'year'] as const
export type Period = typeof periods[number]

export type DateUTC = number

export type Range = {
  end: DateUTC
  start: DateUTC
}
