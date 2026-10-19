import { z } from 'zod/v4'

import type { CurrencyCode } from '~/components/currencies/types'

import { random } from '~/assets/js/emo'
import { colorsArray } from '~/components/color/colors'

export const walletTypes = ['cash', 'credit_card', 'loan', 'bank_account', 'deposit', 'crypto', 'debt'] as const
export type WalletType = typeof walletTypes[number]

export type WalletId = string

export type WalletViewTypes = WalletType | 'isAvailable' | 'isAvailableAll' | 'isWithdrawable' | 'isArchived' | 'isExcludedFromTotal'

export const walletItemSchema = z.object({
  color: z.string().default(() => random(colorsArray)),
  createdAt: z.number().int().default(() => Date.now()),
  // Minor units; a credit card's only (the `wallets_credit_limit` constraint).
  creditLimit: z.number().int().min(0).optional(),
  currencyCode: z.string().default('USD'),
  description: z.string().default(''),
  isArchived: z.boolean().default(false),
  isExcludedFromTotal: z.boolean().default(false),
  // Absent follows isWithdrawable.
  isInForecast: z.boolean().optional(),
  isWithdrawable: z.boolean().default(false),
  name: z.string().trim().min(1).default(''),
  sortOrder: z.number().int().default(0),
  type: z.enum(walletTypes).default('cash'),
  updatedAt: z.number().int().default(() => Date.now()),
}).refine(w => w.creditLimit === undefined || w.type === 'credit_card', 'only a credit card has a credit limit')

export type WalletItem = z.infer<typeof walletItemSchema>
export type WalletItemComputed = WalletItem & {
  amount: number
  rate?: number
}

export type Wallets = Record<WalletId, WalletItem>
export type WalletsComputed = Record<WalletId, WalletItemComputed>

/** `typeCurrency` groups by type with currency subgroups; `currencyType` is the reverse. */
export type WalletsGroupedBy = 'type' | 'currency' | 'typeCurrency' | 'currencyType' | 'none'
export type WalletsPrimaryGrouping = 'type' | 'currency' | 'none'
export type WalletsCurrencyFiltered = 'all' | CurrencyCode

/** A credit card or a loan: money owed, not owned. */
export const isCreditProduct = (type: WalletType | undefined) => type === 'credit_card' || type === 'loan'

export function getCreditAvailable(creditLimit: number, amount: number): number {
  return creditLimit - Math.abs(amount)
}

export type WalletFormKey = keyof WalletItem

/** Whether the wallet's money counts in the forecast: its own switch, else whether it is withdrawable. */
export const isWalletInForecast = (wallet: WalletItem) => wallet.isInForecast ?? wallet.isWithdrawable
