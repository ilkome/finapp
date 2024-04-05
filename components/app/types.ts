const appNavs = ['summary', 'expense', 'income', 'trns', 'periods'] as const

export type AppNav = typeof appNavs[number]
