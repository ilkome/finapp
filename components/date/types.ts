export type DateValueOf = number

export type PeriodNames = 'day' | 'week' | 'month' | 'year' | 'all'

// Note: dayjs doesn't understand Omit
export type PeriodsNamesExceptAll = 'day' | 'week' | 'month' | 'year'
