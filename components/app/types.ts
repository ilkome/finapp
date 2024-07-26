export const statTabs = ['summary', 'sum', 'expense', 'income', 'trns', 'periods', 'netIncome'] as const

export type StatTabs = typeof statTabs[number]
