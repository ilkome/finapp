import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, nextTick, ref, watch } from 'vue'
import { trnsItems } from '~~/mocks/trns'

import { useTrnsListFilters } from '~/components/trns/useTrnsListFilters'

const state = vi.hoisted(() => ({
  items: null as any,
}))

vi.mock('~/components/trns/useTrnsStore', () => ({
  useTrnsStore: () => ({
    get items() {
      return state.items
    },
  }),
}))

vi.stubGlobal('computed', computed)
vi.stubGlobal('ref', ref)
vi.stubGlobal('watch', watch)
vi.stubGlobal('useI18n', () => ({ t: (key: string) => key }))

describe('useTrnsListFilters', () => {
  beforeEach(() => {
    state.items = {
      ...trnsItems,
      expenseWithDesc: { ...trnsItems.transactionExpenseWalletCashUSD400, desc: 'coffee' },
      incomeWithDesc: { ...trnsItems.transactionIncomeWalletCashUSD1000, desc: 'salary' },
    }
  })

  function createFilters(idsValue: string[], options: {
    showExpense?: boolean
    showIncome?: boolean
    showTransfers?: boolean
  } = {}) {
    const ids = ref(idsValue)
    const filters = useTrnsListFilters({
      ids: computed(() => ids.value),
      showExpense: computed(() => options.showExpense ?? true),
      showIncome: computed(() => options.showIncome ?? true),
      showTransfers: computed(() => options.showTransfers ?? true),
    })

    return { filters, ids }
  }

  it('filters all, expense, income, transfer, and adjustment with shared semantics', () => {
    const ids = [
      'transactionExpenseWalletCashUSD400',
      'transactionIncomeWalletCashUSD1000',
      'singleLegTransferExpenseWalletCashUSD50',
      'adjustmentExpenseWalletCashUSD30',
    ]
    const { filters } = createFilters(ids)

    expect(filters.selectedIds.value).toEqual(ids)
    filters.setFilterBy('expense')
    expect(filters.selectedIds.value).toEqual(['transactionExpenseWalletCashUSD400', 'adjustmentExpenseWalletCashUSD30'])
    filters.setFilterBy('income')
    expect(filters.selectedIds.value).toEqual(['transactionIncomeWalletCashUSD1000'])
    filters.setFilterBy('transfer')
    expect(filters.selectedIds.value).toEqual(['singleLegTransferExpenseWalletCashUSD50'])
    filters.setFilterBy('adjustment')
    expect(filters.selectedIds.value).toEqual(['adjustmentExpenseWalletCashUSD30'])
  })

  it('resets a removed selected tab to all', async () => {
    const { filters, ids } = createFilters(['transactionExpenseWalletCashUSD400', 'transactionIncomeWalletCashUSD1000'])

    filters.setFilterBy('income')
    ids.value = ['transactionExpenseWalletCashUSD400']
    await nextTick()

    expect(filters.filterBy.value).toBe('all')
    expect(filters.selectedIds.value).toEqual(['transactionExpenseWalletCashUSD400'])
  })

  it('applies description-only filtering when some transactions have descriptions', () => {
    const { filters } = createFilters(['transactionExpenseWalletCashUSD400', 'expenseWithDesc', 'incomeWithDesc'])

    expect(filters.isTrnsWithDesc.value).toBe(true)
    expect(filters.isAllTrnsWithDesc.value).toBe(false)
    filters.isShowWithDesc.value = true

    expect(filters.selectedIds.value).toEqual(['expenseWithDesc', 'incomeWithDesc'])
  })

  it('reuses externally owned filter state', () => {
    const filterBy = ref<'all' | 'expense'>('expense')
    const isShowWithDesc = ref(true)
    const filters = useTrnsListFilters({
      ids: computed(() => ['transactionExpenseWalletCashUSD400', 'expenseWithDesc', 'incomeWithDesc']),
      showExpense: computed(() => true),
      showIncome: computed(() => true),
      showTransfers: computed(() => true),
      state: { filterBy, isShowWithDesc },
    })

    expect(filters.selectedIds.value).toEqual(['expenseWithDesc'])
    filters.setFilterBy('expense')
    expect(filterBy.value).toBe('all')
  })

  it('detects no descriptions and all descriptions', () => {
    const withoutDesc = createFilters(['transactionExpenseWalletCashUSD400'])
    expect(withoutDesc.filters.isTrnsWithDesc.value).toBe(false)
    expect(withoutDesc.filters.isAllTrnsWithDesc.value).toBe(false)

    const withDesc = createFilters(['expenseWithDesc', 'incomeWithDesc'])
    expect(withDesc.filters.isTrnsWithDesc.value).toBe(true)
    expect(withDesc.filters.isAllTrnsWithDesc.value).toBe(true)
  })
})
