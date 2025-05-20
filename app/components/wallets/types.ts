import { z } from 'zod/v4'

import type { CurrencyCode } from '~/components/currencies/types'

import { random } from '~/assets/js/emo'
import { colorsArray } from '~/components/color/colors'

export const types = [
  'cash',
  'credit',
  'cashless',
  'deposit',
  'crypto',
  'debt',
] as const

export const viewTypes = [
  ...types,
  'isAvailable',
  'isWithdrawal',
  'isArchived',
  'isExcludeInTotal',
] as const

export type WalletId = string
export type WalletType = typeof types[number]

export type WalletViewTypes = typeof viewTypes[number]

export const icons: Record<WalletType, string> = {
  cash: 'lucide:banknote',
  cashless: 'lucide:landmark',
  credit: 'lucide:piggy-bank',
  crypto: 'lucide:coins',
  debt: 'lucide:hand-coins',
  deposit: 'lucide:diamond-percent',
} as const

export const walletBaseSchema = z.object({
  color: z.string().default(() => random(colorsArray)),
  currency: z.string().default('USD'),
  desc: z.string().default(''),
  editedAt: z.number().default(() => new Date().getTime()),
  isArchived: z.boolean().default(false),
  isExcludeInTotal: z.boolean().default(false),
  isWithdrawal: z.boolean().default(false),
  name: z.string().default(''),
  order: z.number().default(1),
})

export const walletTypeSchema = z.enum(types)

export const walletItemSchema = z.discriminatedUnion('type', [
  z.object({
    ...walletBaseSchema.shape,
    creditLimit: z.number().default(0),
    type: z.literal(types.find(t => t === 'credit')),
  }),
  z.object({
    ...walletBaseSchema.shape,
    type: z.enum(types.filter(t => t !== 'credit')),
  }),
])

// TODO: Deprecate this
export const walletDirtySchema = z.object({
  archived: z.boolean().optional(),
  color: z.string(),
  creditLimit: z.union([z.string(), z.number()]).transform(val => Number(val)).optional(),
  currency: z.string(),
  desc: z.string().optional(),
  description: z.string().optional(),
  edited: z.number().optional(),
  editedAt: z.number().optional(),
  isArchived: z.boolean().optional(),
  isCash: z.boolean().optional(),
  isCashless: z.boolean().optional(),
  isCredit: z.boolean().optional(),
  isDebt: z.boolean().optional(),
  isDeposit: z.boolean().optional(),
  isExcludeInTotal: z.boolean().optional(),
  isWithdrawal: z.boolean().optional(),
  name: z.string(),
  order: z.number(),
  type: walletTypeSchema.optional(),
  withdrawal: z.boolean().optional(),
})

export type WalletItem = z.infer<typeof walletItemSchema>
export type WalletItemDirty = z.infer<typeof walletDirtySchema>
export type WalletItemComputed = WalletItem & {
  amount: number
  rate?: number
}

export type Wallets = Record<WalletId, WalletItem>
export type WalletsDirty = Record<WalletId, WalletItemDirty>
export type WalletsComputed = Record<WalletId, WalletItemComputed>

export type WalletsGroupedBy = 'type' | 'currency' | 'none'
export type WalletsCurrencyFiltered = 'all' | CurrencyCode
