import { v } from 'convex/values'

export const walletTypes = ['cash', 'credit', 'cashless', 'deposit', 'crypto', 'debt'] as const
export type WalletType = typeof walletTypes[number]

export const walletTypeValidator = v.union(
  ...walletTypes.map(t => v.literal(t)) as [
    ReturnType<typeof v.literal>,
    ReturnType<typeof v.literal>,
    ...ReturnType<typeof v.literal>[],
  ],
)

export enum TrnType {
  Expense = 0,
  Income = 1,
  Transfer = 2,
}
