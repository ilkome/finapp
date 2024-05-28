const appNavs = ['summary', 'sum', 'expense', 'income', 'trns', 'periods', 'statNew'] as const

export type AppNav = typeof appNavs[number]
