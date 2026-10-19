import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { useTrnsFormStore } from './useTrnsFormStore'

// --- Mocks ---

vi.mock('~/components/categories/useCategoriesStore', () => ({
  useCategoriesStore: () => ({
    categoriesIdsForTrnValues: ['c1', 'c2'],
    items: {
      c1: { name: 'Food' },
      c2: { name: 'Transport' },
      loan_fine: { name: 'Loan fees' },
      loan_interest: { name: 'Loan interest' },
    },
  }),
}))

const h = vi.hoisted(() => ({ recentWalletIds: [] as string[], trns: {} as Record<string, unknown> }))

vi.mock('~/components/wallets/useWalletsStore', () => ({
  useWalletsStore: () => ({
    currencyOf(id: string) { return (this.items as Record<string, { currencyCode: string }>)[id]?.currencyCode },
    items: {
      c1w: { currencyCode: 'USD', name: 'Credit card', type: 'credit_card' },
      w1: { currencyCode: 'USD', name: 'Cash', type: 'cash' },
      w2: { currencyCode: 'USD', name: 'Card', type: 'bank_account' },
      w3: { currencyCode: 'RUB', name: 'Rub card', type: 'bank_account' },
      w4: { currencyCode: 'JPY', name: 'Yen', type: 'cash' },
    },
    get recentWalletIds() { return h.recentWalletIds },
    sortedIds: ['w1', 'w2', 'c1w'],
  }),
}))

vi.mock('~/components/trns/useTrnsStore', () => ({
  useTrnsStore: () => ({
    get items() { return h.trns },
    lastCreatedTrnItem: null,
  }),
}))

vi.mock('~/components/currencies/useCurrenciesStore', () => ({
  useCurrenciesStore: () => ({ rates: { RUB: 90, USD: 1 } }),
}))

vi.mock('~/composables/useStoreSync', () => ({
  showErrorToast: vi.fn(),
}))

vi.mock('~~/utils/generateId', () => ({
  generateId: () => 'generated-id',
}))

beforeEach(() => {
  setActivePinia(createPinia())
  h.recentWalletIds = []
  h.trns = {}
})

describe('useTrnsFormStore', () => {
  describe('initial state', () => {
    it('has default values', () => {
      const store = useTrnsFormStore()
      expect(store.values.trnType).toBe('expense')
      expect(store.values.amount).toEqual([0, 0, 0])
      expect(store.values.categoryId).toBeNull()
      expect(store.values.walletId).toBeNull()
      expect(store.ui.isShow).toBe(false)
    })
  })

  describe('activeAmountIdx', () => {
    it('returns 0 for expense', () => {
      const store = useTrnsFormStore()
      store.values.trnType = 'expense'
      expect(store.activeAmountIdx).toBe(0)
    })

    it('returns 0 for income', () => {
      const store = useTrnsFormStore()
      store.values.trnType = 'income'
      expect(store.activeAmountIdx).toBe(0)
    })

    it('returns 1 for transfer source side', () => {
      const store = useTrnsFormStore()
      store.values.trnType = 'transfer'
      store.values.transferType = 'from'
      expect(store.activeAmountIdx).toBe(1)
    })

    it('returns 2 for transfer target side', () => {
      const store = useTrnsFormStore()
      store.values.trnType = 'transfer'
      store.values.transferType = 'to'
      expect(store.activeAmountIdx).toBe(2)
    })
  })

  describe('onChangeTrnType', () => {
    it('changes trnType', () => {
      const store = useTrnsFormStore()
      store.onChangeTrnType('income')
      expect(store.values.trnType).toBe('income')
    })
  })

  describe('onChangeTransferType', () => {
    it('changes transferType', () => {
      const store = useTrnsFormStore()
      store.onChangeTransferType('to')
      expect(store.values.transferType).toBe('to')
    })
  })

  describe('onClear', () => {
    it('resets amounts and description but keeps category/wallet', () => {
      const store = useTrnsFormStore()
      store.values.amount = [100, 200, 300]
      store.values.description = 'test'
      store.values.categoryId = 'c1'
      store.values.walletId = 'w1'

      store.onClear()

      expect(store.values.amount).toEqual([0, 0, 0])
      expect(store.values.description).toBeUndefined()
      expect(store.values.categoryId).toBe('c1')
      expect(store.values.walletId).toBe('w1')
    })
  })

  describe('$reset', () => {
    it('resets all values to defaults', () => {
      const store = useTrnsFormStore()
      store.values.amount = [100, 200, 300]
      store.values.categoryId = 'c1'
      store.values.walletId = 'w1'
      store.values.trnType = 'transfer'
      store.ui.isShow = true

      store.$reset()

      expect(store.values.amount).toEqual([0, 0, 0])
      expect(store.values.categoryId).toBeNull()
      expect(store.values.walletId).toBeNull()
      expect(store.values.trnType).toBe('expense')
      expect(store.ui.isShow).toBe(false)
    })
  })

  describe('onClose', () => {
    it('hides form', () => {
      const store = useTrnsFormStore()
      store.ui.isShow = true

      store.onClose()

      expect(store.ui.isShow).toBe(false)
    })

    it('clears when editing (trnId set)', () => {
      const store = useTrnsFormStore()
      store.values.trnId = 'trn1'
      store.values.amount = [100, 0, 0]
      store.ui.isShow = true

      store.onClose()

      expect(store.values.amount).toEqual([0, 0, 0])
      expect(store.values.trnId).toBeNull()
      expect(store.ui.isShow).toBe(false)
    })
  })

  describe('openFormForCreate', () => {
    it('opens form and sets initial values from wallets/categories', () => {
      const store = useTrnsFormStore()

      store.openFormForCreate()

      expect(store.ui.isShow).toBe(true)
      expect(store.values.trnType).toBe('expense')
      expect(store.values.walletId).toBe('w1')
      expect(store.values.categoryId).toBe('c1')
      expect(store.values.toWalletId).toBe('w1')
      expect(store.values.fromWalletId).toBe('w2')
    })
  })

  describe('openFormForEdit', () => {
    it('does nothing if trn not found', () => {
      const store = useTrnsFormStore()

      store.openFormForEdit('nonexistent')

      expect(store.ui.isShow).toBe(false)
    })
  })

  describe('onSubmit', () => {
    it('returns error toast when wallet not selected', async () => {
      const store = useTrnsFormStore()
      store.values.trnType = 'expense'
      store.values.walletId = null

      const result = await store.onSubmit()

      expect(result).toBeUndefined()
      const { showErrorToast } = await import('~/composables/useStoreSync')
      expect(showErrorToast).toHaveBeenCalledWith('trnForm.errors.selectWallet')
    })

    it('returns error toast when category not selected', async () => {
      const store = useTrnsFormStore()
      store.values.trnType = 'expense'
      store.values.walletId = 'w1'
      store.values.categoryId = null

      const result = await store.onSubmit()

      expect(result).toBeUndefined()
      const { showErrorToast } = await import('~/composables/useStoreSync')
      expect(showErrorToast).toHaveBeenCalledWith('trnForm.errors.selectCategory')
    })

    it('returns id and values for valid expense', async () => {
      const store = useTrnsFormStore()
      store.values.trnType = 'expense'
      store.values.walletId = 'w1'
      store.values.categoryId = 'c1'
      store.onChangeAmount('1.5')
      store.values.date = 1699920000000

      const result = await store.onSubmit()

      expect(result).toBeDefined()
      expect(result!.id).toBe('generated-id')
      expect(result!.values).toMatchObject({ categoryId: 'c1', fromAmount: 150, fromWalletId: 'w1', type: 'expense' })
    })

    it('uses existing trnId when editing', async () => {
      const store = useTrnsFormStore()
      store.values.trnType = 'expense'
      store.values.walletId = 'w1'
      store.values.categoryId = 'c1'
      store.onChangeAmount('1')
      store.values.date = 1699920000000
      store.values.trnId = 'existing-trn-id'

      const result = await store.onSubmit()

      expect(result).toBeDefined()
      expect(result!.id).toBe('existing-trn-id')
    })
  })

  describe('minor units', () => {
    it('parses typed amounts in the scale of the wallet currency', () => {
      const store = useTrnsFormStore()
      store.values.walletId = 'w4'
      store.onChangeAmount('1500')
      expect(store.values.amount[0]).toBe(1500)

      store.values.walletId = 'w1'
      store.onChangeAmount('12.34')
      expect(store.values.amount[0]).toBe(1234)
    })

    it('shows a stored amount as a decimal when editing', () => {
      h.trns = { t1: { categoryId: 'c1', createdAt: 1, date: 86400000, fromAmount: 1234, fromWalletId: 'w1', type: 'expense', updatedAt: 1 } }
      const store = useTrnsFormStore()

      store.openFormForEdit('t1')

      expect(store.values.amount[0]).toBe(1234)
      expect(store.values.amountRaw[0]).toBe('12.34')
    })
  })

  describe('transfer outside the app', () => {
    it('leaves the outside side empty on save', async () => {
      const store = useTrnsFormStore()
      store.openFormForCreate()
      store.values.trnType = 'transfer'
      store.onTransferOutside('from')
      store.values.transferType = 'to'
      store.onChangeAmount('5')

      const result = await store.onSubmit()

      expect(result!.values).toEqual(expect.objectContaining({ toAmount: 500, toWalletId: 'w1', type: 'transfer' }))
      expect(result!.values.fromWalletId).toBeUndefined()
    })

    it('opens a one-sided transfer with its outside side marked', () => {
      h.trns = { t1: { createdAt: 1, date: 86400000, toAmount: 500, toWalletId: 'w2', type: 'transfer', updatedAt: 1 } }
      const store = useTrnsFormStore()

      store.openFormForEdit('t1')

      expect(store.values.transferOutside).toBe('from')
      expect(store.transferFromWalletId).toBeUndefined()
      expect(store.transferToWalletId).toBe('w2')
    })
  })

  describe('interest of a transfer into a credit wallet', () => {
    it('offers a disabled interest draft for a new transfer into a credit wallet only', () => {
      const store = useTrnsFormStore()
      store.values.trnType = 'transfer'
      store.values.toWalletId = 'c1w'
      expect(store.values.loanInterest).toEqual({ amount: 0, amountRaw: '', isEnabled: false })

      store.values.toWalletId = 'w2'
      expect(store.values.loanInterest).toBeUndefined()
    })

    it('is reset by $reset', () => {
      const store = useTrnsFormStore()
      store.openFormForLoanPayment({ date: 1699920000000, interest: 250, principal: 1000, walletId: 'c1w' })

      store.$reset()

      expect(store.values.loanInterest).toBeUndefined()
    })
  })

  describe('openFormForLoanPayment', () => {
    it('prefills a transfer plus the interest draft', () => {
      const store = useTrnsFormStore()

      store.openFormForLoanPayment({
        date: 1699920000000,
        interest: 250,
        principal: 1000,
        walletId: 'c1w',
      })

      expect(store.ui.isShow).toBe(true)
      expect(store.values.trnType).toBe('transfer')
      expect(store.values.fromWalletId).toBe('w1')
      expect(store.values.toWalletId).toBe('c1w')
      expect(store.values.amount).toEqual([0, 1250, 1250])
      expect(store.values.date).toBe(1699920000000)
      expect(store.values.loanInterest).toEqual({
        amount: 250,
        amountRaw: '2.5',
        isEnabled: true,
      })
    })

    it('drops an unsaved interest draft when an existing transfer opens', async () => {
      h.trns = { t1: { createdAt: 1, date: 86400000, fromAmount: 500, fromWalletId: 'w1', toAmount: 500, toWalletId: 'c1w', type: 'transfer', updatedAt: 1 } }
      const store = useTrnsFormStore()
      store.openFormForLoanPayment({ date: 1699920000000, interest: 250, principal: 1000, walletId: 'c1w' })
      store.ui.isShow = false

      store.openFormForEdit('t1')
      await nextTick()

      expect(store.values.loanInterest).toBeUndefined()
    })

    it('prefers the most recently used non-credit wallet over the first sorted one', () => {
      h.recentWalletIds = ['c1w', 'w2', 'w1']
      const store = useTrnsFormStore()

      store.openFormForLoanPayment({
        date: 1699920000000,
        interest: 0,
        principal: 1000,
        walletId: 'c1w',
      })

      expect(store.values.fromWalletId).toBe('w2')
    })

    it('converts the debit side into the source wallet currency', () => {
      const store = useTrnsFormStore()

      store.openFormForLoanPayment({ date: 1699920000000, interest: 0, paymentWalletId: 'w3', principal: 10, walletId: 'c1w' })

      expect(store.values.amount).toEqual([0, 900, 10])
    })

    it('uses the given debit wallet and skips a zero interest', () => {
      const store = useTrnsFormStore()

      store.openFormForLoanPayment({
        date: 1699920000000,
        interest: 0,
        paymentWalletId: 'w2',
        principal: 500,
        walletId: 'c1w',
      })

      expect(store.values.fromWalletId).toBe('w2')
      expect(store.values.loanInterest).toBeUndefined()
    })

    it('submits the whole payment and the interest as the credit wallet expense together', async () => {
      const store = useTrnsFormStore()

      store.openFormForLoanPayment({
        date: 1699920000000,
        interest: 250,
        principal: 1000,
        walletId: 'c1w',
      })

      const result = await store.onSubmit()

      expect(result!.values).toMatchObject({
        fromAmount: 1250,
        fromWalletId: 'w1',
        toAmount: 1250,
        toWalletId: 'c1w',
        type: 'transfer',
      })
      expect(result!.extra!.values).toMatchObject({
        categoryId: 'loan_interest',
        fromAmount: 250,
        fromWalletId: 'c1w',
        type: 'expense',
      })
    })

    it('drops the interest expense when the toggle is off', async () => {
      const store = useTrnsFormStore()

      store.openFormForLoanPayment({
        date: 1699920000000,
        interest: 250,
        principal: 1000,
        walletId: 'c1w',
      })
      store.values.loanInterest!.isEnabled = false

      const result = await store.onSubmit()

      expect(result!.extra).toBeUndefined()
    })

    it('keeps the interest amount editable', () => {
      const store = useTrnsFormStore()

      store.openFormForLoanPayment({
        date: 1699920000000,
        interest: 250,
        principal: 1000,
        walletId: 'c1w',
      })
      store.onChangeLoanInterestAmount('300')

      expect(store.values.loanInterest!.amount).toBe(30000)
    })
  })

  describe('modal', () => {
    it('opens and closes description modal', () => {
      const store = useTrnsFormStore()

      store.openTrnFormModal('description')
      expect(store.modal.description).toBe(true)

      store.closeTrnFormModal('description')
      expect(store.modal.description).toBe(false)
    })
  })
})
