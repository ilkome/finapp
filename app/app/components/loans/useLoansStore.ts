import type { Row } from '~~/services/powersync/transforms'

import { watchTable } from '~~/services/powersync/db'
import { deleteRow, upsertRow } from '~~/services/powersync/mutations'
import { loanScheduleRowToRow, loanToRow, rowToLoan, rowToLoanScheduleRow } from '~~/services/powersync/transforms'

import type { CurrencyCode } from '~/components/currencies/types'
import type { LoanCost, LoanSummary, LoanTrn, OverpaymentMode, WhatIfResult } from '~/components/loans/engine/types'
import type { LoanId, LoanItem, Loans, LoanScheduleRowId, LoanScheduleRowItem, LoanScheduleRows } from '~/components/loans/types'
import type { WalletId } from '~/components/wallets/types'

import { getAmountInRate } from '~/components/amount/getTotal'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useDemo } from '~/components/demo/useDemo'
import { bankNextPaymentAmount, deriveDue, deriveLoan, overridesByLoan, projectionParams } from '~/components/loans/engine/derive'
import { collectCreditTrns, costOf } from '~/components/loans/engine/ledger'
import { whatIf } from '~/components/loans/engine/summary'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { resolveWriteUid } from '~/composables/useAuthSession'
import { useCivilToday } from '~/composables/useCivilToday'
import { persistStoreCache } from '~/composables/useStoreCache'
import { createDebouncedPersist, showErrorToast } from '~/composables/useStoreSync'
import { useSupabaseAuth } from '~/composables/useSupabase'
import { createLogger } from '~/utils/logger'

const logger = createLogger('loans')

export type LoansCache = {
  items: Loans
  scheduleRows: LoanScheduleRows
}

export const useLoansStore = defineStore('loans', () => {
  const trnsStore = useTrnsStore()
  const walletsStore = useWalletsStore()
  const currenciesStore = useCurrenciesStore()
  const { isDemo } = useDemo()
  const { uid } = useSupabaseAuth()
  const today = useCivilToday()

  const items = shallowRef<Loans>({})
  const scheduleRows = shallowRef<LoanScheduleRows>({})

  let loansWatch: AbortController | null = null
  let rowsWatch: AbortController | null = null

  const persistItems = createDebouncedPersist<Loans>(STORAGE_KEYS.loans)
  const persistRows = createDebouncedPersist<LoanScheduleRows>(STORAGE_KEYS.loanScheduleRows)

  function cache() {
    if (isDemo.value) {
      persistItems(items.value)
      persistRows(scheduleRows.value)
    }
    else {
      persistStoreCache('loans', { items: items.value, scheduleRows: scheduleRows.value } satisfies LoansCache)
    }
  }

  function setLoans(values: Loans) {
    items.value = values
    cache()
  }

  function setScheduleRows(values: LoanScheduleRows) {
    scheduleRows.value = values
    cache()
  }

  /** Cold-start paint from the per-user snapshot before the SQLite watch emits. See wallets store. */
  function primeFromCache(data: LoansCache | null): void {
    if (isDemo.value || !data)
      return
    if (!Object.keys(items.value).length)
      items.value = data.items ?? {}
    if (!Object.keys(scheduleRows.value).length)
      scheduleRows.value = data.scheduleRows ?? {}
  }

  function initLoans(): void {
    if (isDemo.value)
      return
    loansWatch?.abort()
    rowsWatch?.abort()
    loansWatch = watchTable<Row>('SELECT * FROM loans', [], (rows) => {
      setLoans(Object.fromEntries(rows.map(row => [row.id, rowToLoan(row)])))
    })
    rowsWatch = watchTable<Row>('SELECT * FROM loan_schedule_rows', [], (rows) => {
      setScheduleRows(Object.fromEntries(rows.map(row => [row.id, rowToLoanScheduleRow(row)])))
    })
    logger.log('watching loans')
  }

  const creditWalletIds = computed(() => new Set(
    Object.entries(walletsStore.items ?? {})
      .filter(([, wallet]) => wallet?.type === 'credit')
      .map(([id]) => id),
  ))

  const loanIdByWalletId = computed(() => new Map<WalletId, LoanId>(
    Object.entries(items.value).map(([id, loan]) => [loan.walletId, id]),
  ))

  const trnsByCreditWallet = computed<Map<WalletId, LoanTrn[]>>(
    () => collectCreditTrns(trnsStore.items ?? {}, creditWalletIds.value),
  )

  const byWalletId = computed<Map<WalletId, { loan: LoanItem, summary: LoanSummary }>>(() => {
    const overrides = overridesByLoan(scheduleRows.value)

    return new Map(Object.entries(items.value).map(([loanId, loan]) => [loan.walletId, {
      loan,
      summary: deriveLoan(
        loan,
        overrides.get(loanId) ?? [],
        trnsByCreditWallet.value.get(loan.walletId) ?? [],
        walletsStore.itemsComputed[loan.walletId]?.amount ?? 0,
        today.value,
      ),
    }]))
  })

  /** Interest and fees of every credit wallet, including the revolving ones with no `loans` row. */
  const costByWalletId = computed<Map<WalletId, LoanCost>>(() => new Map(
    [...creditWalletIds.value].map(walletId => [walletId, costOf(trnsByCreditWallet.value.get(walletId) ?? [])]),
  ))

  const dueThisMonth = computed<{ amount: number, nearestDate: number } | null>(() => {
    const revolving: { currency: CurrencyCode, minPaymentAmount: number, minPaymentDate: number, walletId: WalletId }[] = []

    for (const walletId of creditWalletIds.value) {
      if (loanIdByWalletId.value.has(walletId))
        continue
      const wallet = walletsStore.items?.[walletId]
      if (wallet?.type !== 'credit' || !wallet.minPaymentAmount || wallet.minPaymentDate == null)
        continue
      revolving.push({ currency: wallet.currency, minPaymentAmount: wallet.minPaymentAmount, minPaymentDate: wallet.minPaymentDate, walletId })
    }

    return deriveDue(
      [...byWalletId.value].map(([walletId, { loan, summary }]) => ({
        bankAmount: bankNextPaymentAmount(loan, summary.nextPayment),
        currency: walletsStore.items?.[walletId]?.currency ?? currenciesStore.base,
        summary,
        walletId,
      })),
      revolving,
      today.value,
      (amount, currencyCode) => getAmountInRate({ amount, baseCurrencyCode: currenciesStore.base, currencyCode, rates: currenciesStore.rates }),
    )
  })

  function saveLoan(id: LoanId, values: LoanItem) {
    const prev = items.value
    setLoans({ ...items.value, [id]: values })
    if (isDemo.value)
      return

    upsertRow('loans', id, loanToRow(values, resolveWriteUid(uid.value))).catch((e) => {
      setLoans(prev)
      logger.error('saveLoan failed', e)
      showErrorToast('loans.errors.saveFailed')
    })
  }

  function deleteLoan(id: LoanId) {
    const prevLoans = items.value
    const prevRows = scheduleRows.value
    const loans = { ...items.value }
    delete loans[id]
    setLoans(loans)

    const ownRowIds = Object.keys(scheduleRows.value).filter(rowId => scheduleRows.value[rowId]?.loanId === id)
    if (ownRowIds.length) {
      const rows = { ...scheduleRows.value }
      for (const rowId of ownRowIds)
        delete rows[rowId]
      setScheduleRows(rows)
    }

    if (isDemo.value)
      return

    Promise.all([deleteRow('loans', id), ...ownRowIds.map(rowId => deleteRow('loan_schedule_rows', rowId))]).catch((e) => {
      setLoans(prevLoans)
      setScheduleRows(prevRows)
      logger.error('deleteLoan failed', e)
      showErrorToast('loans.errors.deleteFailed')
    })
  }

  function saveScheduleRow(id: LoanScheduleRowId, values: LoanScheduleRowItem) {
    const prev = scheduleRows.value
    setScheduleRows({ ...scheduleRows.value, [id]: values })
    if (isDemo.value)
      return

    upsertRow('loan_schedule_rows', id, loanScheduleRowToRow(values, resolveWriteUid(uid.value))).catch((e) => {
      setScheduleRows(prev)
      logger.error('saveScheduleRow failed', e)
      showErrorToast('loans.errors.saveFailed')
    })
  }

  function deleteScheduleRow(id: LoanScheduleRowId) {
    const prev = scheduleRows.value
    const rows = { ...scheduleRows.value }
    delete rows[id]
    setScheduleRows(rows)
    if (isDemo.value)
      return

    deleteRow('loan_schedule_rows', id).catch((e) => {
      setScheduleRows(prev)
      logger.error('deleteScheduleRow failed', e)
      showErrorToast('loans.errors.deleteFailed')
    })
  }

  function getWhatIf(walletId: WalletId, extra: number, mode: OverpaymentMode): WhatIfResult | null {
    const entry = byWalletId.value.get(walletId)
    const params = entry && projectionParams(entry.loan, entry.summary)
    if (!entry || !params)
      return null
    return whatIf(params, entry.summary.rows, extra, mode, today.value)
  }

  return {
    byWalletId,
    costByWalletId,
    deleteLoan,
    deleteScheduleRow,
    dueThisMonth,
    getWhatIf,
    initLoans,
    items,
    loanIdByWalletId,
    primeFromCache,
    saveLoan,
    saveScheduleRow,
    scheduleRows,
    setLoans,
    setScheduleRows,
    trnsByCreditWallet,
  }
})
