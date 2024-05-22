const appNavs = ['summary', 'sum', 'expense', 'income', 'trns', 'periods'] as const

export type AppNav = typeof appNavs[number]
