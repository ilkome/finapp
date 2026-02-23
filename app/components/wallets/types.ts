import { z } from 'zod/v4'

import type { CurrencyCode } from '~/components/currencies/types'

import { random } from '~/assets/js/emo'
import { colorsArray } from '~/components/color/colors'

export const walletTypes = ['cash', 'credit', 'cashless', 'deposit', 'crypto', 'debt'] as const
export type WalletType = typeof walletTypes[number]

export type WalletId = string

export type WalletViewTypes = WalletType | 'isAvailable' | 'isWithdrawal' | 'isArchived' | 'isExcludeInTotal'

const walletBaseSchema = z.object({
  color: z.string().default(() => random(colorsArray)),
  currency: z.string().default('USD'),
  desc: z.string().default(''),
  isArchived: z.boolean().default(false),
  isExcludeInTotal: z.boolean().default(false),
  isWithdrawal: z.boolean().default(false),
  name: z.string().trim().min(1).default(''),
  order: z.number().default(0),
  updatedAt: z.number().default(() => new Date().getTime()),
})

export const walletItemSchema = z.discriminatedUnion('type', [
  z.object({
    ...walletBaseSchema.shape,
    creditLimit: z.number().default(0),
    type: z.literal('credit'),
  }),
  z.object({
    ...walletBaseSchema.shape,
    type: z.enum(walletTypes.filter(t => t !== 'credit')),
  }),
])

export type WalletItem = z.infer<typeof walletItemSchema>
export type WalletItemComputed = WalletItem & {
  amount: number
  rate?: number
}

export type Wallets = Record<WalletId, WalletItem>
export type WalletsComputed = Record<WalletId, WalletItemComputed>

export type WalletsGroupedBy = 'type' | 'currency' | 'none'
export type WalletsCurrencyFiltered = 'all' | CurrencyCode
