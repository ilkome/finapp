import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TrnType } from '~/components/trns/types'

import { useTrnsFormStore } from './useTrnsFormStore'

// --- Mocks ---

vi.mock('~/components/categories/useCategoriesStore', () => ({
  useCategoriesStore: () => ({
    categoriesIdsForTrnValues: ['c1', 'c2'],
    items: {
      c1: { name: 'Food' },
      c2: { name: 'Transport' },
      loanFine: { name: 'Loan fees' },
      loanInterest: { name: 'Loan interest' },
    },
  }),
}))

const h = vi.hoisted(() => ({ recentWalletIds: [] as string[] }))

vi.mock('~/components/wallets/useWalletsStore', () => ({
  useWalletsStore: () => ({
    items: {
      c1w: { currency: 'USD', name: 'Credit card', type: 'credit' },
      w1: { currency: 'USD', name: 'Cash', type: 'cash' },
      w2: { currency: 'USD', name: 'Card', type: 'cashless' },
    },
    get recentWalletIds() { return h.recentWalletIds },
    sortedIds: ['w1', 'w2', 'c1w'],
  }),
}))

vi.mock('~/components/trns/useTrnsStore', () => ({
  useTrnsStore: () => ({
    items: {},
    lastCreatedTrnItem: null,
  }),
}))

vi.mock('~/composables/useStoreSync', () => ({
  showErrorToast: vi.fn(),
}))

vi.mock('~~/utils/generateId', () => ({
  generateId: () => 'generated-id',
}))

vi.mock('~/components/amount/utils', () => ({
  formatByCurrency: (amount: number) => String(amount),
}))

beforeEach(() => {
  setActivePinia(createPinia())
  h.recentWalletIds = []
})

describe('useTrnsFormStore', () => {
  describe('initial state', () => {
    it('has default values', () => {
      const store = useTrnsFormStore()
      expect(store.values.trnType).toBe(TrnType.Expense)
      expect(store.values.amount).toEqual([0, 0, 0])
      expect(store.values.categoryId).toBeNull()
      expect(store.values.walletId).toBeNull()
      expect(store.ui.isShow).toBe(false)
    })
  })

  describe('activeAmountIdx', () => {
    it('returns 0 for expense', () => {
      const store = useTrnsFormStore()
      store.values.trnType = TrnType.Expense
      expect(store.activeAmountIdx).toBe(0)
    })

    it('returns 0 for income', () => {
      const store = useTrnsFormStore()
      store.values.trnType = TrnType.Income
      expect(store.activeAmountIdx).toBe(0)
    })

    it('returns 1 for transfer expense side', () => {
      const store = useTrnsFormStore()
      store.values.trnType = TrnType.Transfer
      store.values.transferType = 'expense'
      expect(store.activeAmountIdx).toBe(1)
    })

    it('returns 2 for transfer income side', () => {
      const store = useTrnsFormStore()
      store.values.trnType = TrnType.Transfer
      store.values.transferType = 'income'
      expect(store.activeAmountIdx).toBe(2)
    })
  })

  describe('onChangeTrnType', () => {
    it('changes trnType', () => {
      const store = useTrnsFormStore()
      store.onChangeTrnType(TrnType.Income)
      expect(store.values.trnType).toBe(TrnType.Income)
    })
  })

  describe('onChangeTransferType', () => {
    it('changes transferType', () => {
      const store = useTrnsFormStore()
      store.onChangeTransferType('income')
      expect(store.values.transferType).toBe('income')
    })
  })

  describe('onClear', () => {
    it('resets amounts and description but keeps category/wallet', () => {
      const store = useTrnsFormStore()
      store.values.amount = [100, 200, 300]
      store.values.desc = 'test'
      store.values.categoryId = 'c1'
      store.values.walletId = 'w1'

      store.onClear()

      expect(store.values.amount).toEqual([0, 0, 0])
      expect(store.values.desc).toBeUndefined()
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
      store.values.trnType = TrnType.Transfer
      store.ui.isShow = true

      store.$reset()

      expect(store.values.amount).toEqual([0, 0, 0])
      expect(store.values.categoryId).toBeNull()
      expect(store.values.walletId).toBeNull()
      expect(store.values.trnType).toBe(TrnType.Expense)
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
      expect(store.values.trnType).toBe(TrnType.Expense)
      expect(store.values.walletId).toBe('w1')
      expect(store.values.categoryId).toBe('c1')
      expect(store.values.incomeWalletId).toBe('w1')
      expect(store.values.expenseWalletId).toBe('w2')
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
      store.values.trnType = TrnType.Expense
      store.values.walletId = null

      const result = await store.onSubmit()

      expect(result).toBeUndefined()
      const { showErrorToast } = await import('~/composables/useStoreSync')
      expect(showErrorToast).toHaveBeenCalledWith('trnForm.errors.selectWallet')
    })

    it('returns error toast when category not selected', async () => {
      const store = useTrnsFormStore()
      store.values.trnType = TrnType.Expense
      store.values.walletId = 'w1'
      store.values.categoryId = null

      const result = await store.onSubmit()

      expect(result).toBeUndefined()
      const { showErrorToast } = await import('~/composables/useStoreSync')
      expect(showErrorToast).toHaveBeenCalledWith('trnForm.errors.selectCategory')
    })

    it('returns id and values for valid expense', async () => {
      const store = useTrnsFormStore()
      store.values.trnType = TrnType.Expense
      store.values.walletId = 'w1'
      store.values.categoryId = 'c1'
      store.values.amount = [100, 0, 0]
      store.values.date = 1700000000000

      const result = await store.onSubmit()

      expect(result).toBeDefined()
      expect(result!.id).toBe('generated-id')
      expect(result!.values).toBeDefined()
    })

    it('uses existing trnId when editing', async () => {
      const store = useTrnsFormStore()
      store.values.trnType = TrnType.Expense
      store.values.walletId = 'w1'
      store.values.categoryId = 'c1'
      store.values.amount = [100, 0, 0]
      store.values.date = 1700000000000
      store.values.trnId = 'existing-trn-id'

      const result = await store.onSubmit()

      expect(result).toBeDefined()
      expect(result!.id).toBe('existing-trn-id')
    })
  })

  describe('interest of a transfer into a credit wallet', () => {
    it('offers a disabled interest draft for a new transfer into a credit wallet only', () => {
      const store = useTrnsFormStore()
      store.values.trnType = TrnType.Transfer
      store.values.incomeWalletId = 'c1w'
      expect(store.values.loanInterest).toEqual({ amount: 0, amountRaw: '', isEnabled: false })

      store.values.incomeWalletId = 'w2'
      expect(store.values.loanInterest).toBeUndefined()
    })

    it('is reset by $reset', () => {
      const store = useTrnsFormStore()
      store.openFormForLoanPayment({ date: 1700000000000, interest: 250, principal: 1000, walletId: 'c1w' })

      store.$reset()

      expect(store.values.loanInterest).toBeUndefined()
    })
  })

  describe('openFormForLoanPayment', () => {
    it('prefills a transfer plus the interest draft', () => {
      const store = useTrnsFormStore()

      store.openFormForLoanPayment({
        date: 1700000000000,
        interest: 250,
        principal: 1000,
        walletId: 'c1w',
      })

      expect(store.ui.isShow).toBe(true)
      expect(store.values.trnType).toBe(TrnType.Transfer)
      expect(store.values.expenseWalletId).toBe('w1')
      expect(store.values.incomeWalletId).toBe('c1w')
      expect(store.values.amount).toEqual([0, 1250, 1250])
      expect(store.values.date).toBe(1700000000000)
      expect(store.values.loanInterest).toEqual({
        amount: 250,
        amountRaw: '250',
        isEnabled: true,
      })
    })

    it('prefers the most recently used non-credit wallet over the first sorted one', () => {
      h.recentWalletIds = ['c1w', 'w2', 'w1']
      const store = useTrnsFormStore()

      store.openFormForLoanPayment({
        date: 1700000000000,
        interest: 0,
        principal: 1000,
        walletId: 'c1w',
      })

      expect(store.values.expenseWalletId).toBe('w2')
    })

    it('uses the given debit wallet and skips a zero interest', () => {
      const store = useTrnsFormStore()

      store.openFormForLoanPayment({
        date: 1700000000000,
        debitWalletId: 'w2',
        interest: 0,
        principal: 500,
        walletId: 'c1w',
      })

      expect(store.values.expenseWalletId).toBe('w2')
      expect(store.values.loanInterest).toBeUndefined()
    })

    it('submits the whole payment and the interest as the credit wallet expense together', async () => {
      const store = useTrnsFormStore()

      store.openFormForLoanPayment({
        date: 1700000000000,
        interest: 250,
        principal: 1000,
        walletId: 'c1w',
      })

      const result = await store.onSubmit()

      expect(result!.values).toMatchObject({
        expenseAmount: 1250,
        expenseWalletId: 'w1',
        incomeAmount: 1250,
        incomeWalletId: 'c1w',
        type: TrnType.Transfer,
      })
      expect(result!.extra!.values).toMatchObject({
        amount: 250,
        categoryId: 'loanInterest',
        type: TrnType.Expense,
        walletId: 'c1w',
      })
    })

    it('drops the interest expense when the toggle is off', async () => {
      const store = useTrnsFormStore()

      store.openFormForLoanPayment({
        date: 1700000000000,
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
        date: 1700000000000,
        interest: 250,
        principal: 1000,
        walletId: 'c1w',
      })
      store.onChangeLoanInterestAmount('300')

      expect(store.values.loanInterest!.amount).toBe(300)
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
