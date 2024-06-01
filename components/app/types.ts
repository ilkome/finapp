const appNavs = ['summary', 'sum', 'expense', 'income', 'trns', 'periods', 'netIncome'] as const

export type AppNav = typeof appNavs[number]
