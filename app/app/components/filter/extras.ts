import type { LocationQuery } from 'vue-router'

import { z } from 'zod'

import type { Categories } from '~/components/categories/types'
import type { CurrencyCode, Rates } from '~/components/currencies/types'
import type { TrnItem, TrnsViewType } from '~/components/trns/types'
import type { Wallets } from '~/components/wallets/types'

import { getAmountInRate } from '~/components/amount/getTotal'
import { formatAmount } from '~/components/amount/utils'
import { matchesTrnViewType } from '~/components/trns/tabClassification'
import { trnsViewTypes } from '~/components/trns/types'

export type FilterDescMode = 'all' | 'with' | 'without'

export type FilterExtras = {
  amountMax: number | null
  amountMin: number | null
  desc: FilterDescMode
  search: string
  type: TrnsViewType
}

export type ExtrasChip = {
  icon: string
  key: 'amount' | 'desc' | 'search' | 'type'
  label: string
  patch: Partial<FilterExtras>
  tooltip: string
}

export type ExtrasChipLabels = {
  amount: string
  desc: string
  descMode: Record<Exclude<FilterDescMode, 'all'>, string>
  search: string
  type: string
  types: Record<Exclude<TrnsViewType, 'all'>, string>
}

export const filterExtrasSchema = z.object({
  amountMax: z.number().nullable(),
  amountMin: z.number().nullable(),
  desc: z.enum(['all', 'with', 'without']),
  search: z.string(),
  type: z.enum(trnsViewTypes),
}) satisfies z.ZodType<FilterExtras>

export const defaultFilterExtras: FilterExtras = {
  amountMax: null,
  amountMin: null,
  desc: 'all',
  search: '',
  type: 'all',
}

const descModes: FilterDescMode[] = ['all', 'with', 'without']

const typeIcons: Record<Exclude<TrnsViewType, 'all'>, string> = {
  adjustment: 'lucide:scale',
  expense: 'lucide:arrow-down',
  income: 'lucide:arrow-up',
  transfer: 'lucide:arrow-left-right',
}

function firstQueryValue(value: unknown): string {
  if (Array.isArray(value))
    return value.find(item => typeof item === 'string') ?? ''
  return typeof value === 'string' ? value : ''
}

function parseNumber(value: unknown): number | null {
  const raw = firstQueryValue(value)
  if (!raw)
    return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

export function parseFilterExtras(query: LocationQuery): FilterExtras {
  const type = firstQueryValue(query.filterType) as TrnsViewType
  const desc = firstQueryValue(query.filterDesc) as FilterDescMode
  return {
    amountMax: parseNumber(query.filterAmountMax),
    amountMin: parseNumber(query.filterAmountMin),
    desc: descModes.includes(desc) ? desc : 'all',
    search: firstQueryValue(query.filterSearch).trim(),
    type: trnsViewTypes.includes(type) ? type : 'all',
  }
}

export function extrasToQuery(extras: FilterExtras): Record<string, string | undefined> {
  return {
    filterAmountMax: extras.amountMax === null ? undefined : String(extras.amountMax),
    filterAmountMin: extras.amountMin === null ? undefined : String(extras.amountMin),
    filterDesc: extras.desc === 'all' ? undefined : extras.desc,
    filterSearch: extras.search.trim() || undefined,
    filterType: extras.type === 'all' ? undefined : extras.type,
  }
}

export const extrasQueryKeys = Object.keys(extrasToQuery(defaultFilterExtras))

export function countActiveExtras(extras: FilterExtras): number {
  return (extras.type !== 'all' ? 1 : 0)
    + (extras.search.trim() ? 1 : 0)
    + (extras.desc !== 'all' ? 1 : 0)
    + (extras.amountMin !== null || extras.amountMax !== null ? 1 : 0)
}

export function isSameExtras(a: FilterExtras, b: FilterExtras): boolean {
  return a.type === b.type
    && a.desc === b.desc
    && a.search.trim() === b.search.trim()
    && a.amountMin === b.amountMin
    && a.amountMax === b.amountMax
}

function formatAmountRange(extras: FilterExtras, currency: CurrencyCode): string {
  const min = extras.amountMin === null ? null : formatAmount(extras.amountMin, currency)
  const max = extras.amountMax === null ? null : formatAmount(extras.amountMax, currency)
  const range = min !== null && max !== null
    ? `${min} - ${max}`
    : min !== null ? `≥ ${min}` : `≤ ${max}`
  return `${range} ${currency}`
}

export function extrasChips(extras: FilterExtras, currency: CurrencyCode, labels: ExtrasChipLabels): ExtrasChip[] {
  const chips: ExtrasChip[] = []
  const search = extras.search.trim()

  if (extras.type !== 'all') {
    const label = labels.types[extras.type]
    chips.push({ icon: typeIcons[extras.type], key: 'type', label, patch: { type: 'all' }, tooltip: `${labels.type}: ${label}` })
  }
  if (search) {
    const label = search.length > 24 ? `${search.slice(0, 24)}…` : search
    chips.push({ icon: 'lucide:search', key: 'search', label: `“${label}”`, patch: { search: '' }, tooltip: `${labels.search}: “${search}”` })
  }
  if (extras.desc !== 'all') {
    const label = labels.descMode[extras.desc]
    chips.push({ icon: 'lucide:text', key: 'desc', label, patch: { desc: 'all' }, tooltip: `${labels.desc}: ${label}` })
  }
  if (extras.amountMin !== null || extras.amountMax !== null) {
    const label = formatAmountRange(extras, currency)
    chips.push({ icon: 'lucide:coins', key: 'amount', label, patch: { amountMax: null, amountMin: null }, tooltip: `${labels.amount}: ${label}` })
  }
  return chips
}

export type ExtrasMatcherContext = {
  baseCurrency?: CurrencyCode
  categories?: Categories | null
  rates?: Rates
  wallets: Wallets | null
}

/**
 * Amount is compared unsigned in the base currency, so `min` keeps both large expenses and large incomes.
 * Search matches the description, the category path (`Parent / Child`) and the wallet name(s).
 */
export function createExtrasMatcher(extras: FilterExtras, ctx: ExtrasMatcherContext): (trn: TrnItem | undefined) => boolean {
  if (countActiveExtras(extras) === 0)
    return trn => !!trn

  const search = extras.search.trim().toLocaleLowerCase()
  const { amountMax, amountMin, desc, type } = extras

  function amountInBase(trn: TrnItem): number {
    const walletId = 'walletId' in trn ? trn.walletId : trn.expenseWalletId
    const amount = 'amount' in trn ? trn.amount : trn.expenseAmount
    const currencyCode = ctx.wallets?.[walletId]?.currency
    if (!currencyCode)
      return amount
    return getAmountInRate({ amount, baseCurrencyCode: ctx.baseCurrency, currencyCode, rates: ctx.rates })
  }

  function searchTargets(trn: TrnItem, description: string): string[] {
    const category = ctx.categories?.[trn.categoryId]
    const parent = category?.parentId ? ctx.categories?.[category.parentId] : undefined
    const walletIds = 'walletId' in trn ? [trn.walletId] : [trn.expenseWalletId, trn.incomeWalletId]
    return [
      description,
      parent ? `${parent.name} / ${category?.name ?? ''}` : category?.name ?? '',
      ...walletIds.map(id => ctx.wallets?.[id]?.name ?? ''),
    ]
  }

  return (trn) => {
    if (!trn)
      return false
    if (!matchesTrnViewType(trn, type))
      return false
    const description = (trn.desc ?? '').trim()
    if (desc === 'with' && !description)
      return false
    if (desc === 'without' && description)
      return false
    if (search && !searchTargets(trn, description).some(target => target.toLocaleLowerCase().includes(search)))
      return false
    if (amountMin !== null || amountMax !== null) {
      const amount = Math.abs(amountInBase(trn))
      if (amountMin !== null && amount < amountMin)
        return false
      if (amountMax !== null && amount > amountMax)
        return false
    }
    return true
  }
}
