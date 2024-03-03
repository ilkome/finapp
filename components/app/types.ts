const appNavs = ['summary', 'expense', 'income', 'trns'] as const

export type AppNav = typeof appNavs[number]
