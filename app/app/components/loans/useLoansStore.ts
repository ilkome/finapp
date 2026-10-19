import type { Row } from '~~/services/powersync/transforms'

import { watchTable } from '~~/services/powersync/db'
import { deleteRow, deleteRows, upsertRow } from '~~/services/powersync/mutations'
import { loanScheduleOverrideToRow, loanToRow, rowToLoan, rowToLoanScheduleOverride } from '~~/services/powersync/transforms'

import type { BankReport } from '~/components/bankReports/types'
import type { CurrencyCode } from '~/components/currencies/types'
import type { LoanCost, LoanSummary, LoanTrn, PrepaymentMode, ScheduleOverride, WhatIfResult } from '~/components/loans/engine/types'
import type { LoanId, LoanItem, Loans, LoanScheduleOverrideId, LoanScheduleOverrideItem, LoanScheduleOverrides } from '~/components/loans/types'
import type { WalletId } from '~/components/wallets/types'

import { useBankReportsStore } from '~/components/bankReports/useBankReportsStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useDemo } from '~/components/demo/useDemo'
import { createDeriveLoanMemo, deriveDue, overridesByLoan, projectionParams } from '~/components/loans/engine/derive'
import { collectCreditTrns, costOf } from '~/components/loans/engine/ledger'
import { whatIf } from '~/components/loans/engine/summary'
import { deriveUpcoming, urgentWalletIds } from '~/components/loans/engine/upcoming'
import { graceOf, minPaymentOf } from '~/components/loans/minPayment'
import { loanItemSchema, loanScheduleOverrideSchema } from '~/components/loans/types'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { reconcileRows } from '~/components/trns/reconcile'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { isCreditProduct } from '~/components/wallets/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { resolveWriteUid } from '~/composables/useAuthSession'
import { useCivilToday } from '~/composables/useCivilToday'
import { persistStoreCache } from '~/composables/useStoreCache'
import { createDebouncedPersist, persistOptimistic } from '~/composables/useStoreSync'
import { useSupabaseAuth } from '~/composables/useSupabase'
import { createLogger } from '~/utils/logger'

const logger = createLogger('loans')
const NO_OVERRIDES: ScheduleOverride[] = []

export type LoansCache = {
  items: Loans
  scheduleOverrides: LoanScheduleOverrides
}

export const useLoansStore = defineStore('loans', () => {
  const trnsStore = useTrnsStore()
  const walletsStore = useWalletsStore()
  const currenciesStore = useCurrenciesStore()
  const bankReportsStore = useBankReportsStore()
  const { isDemo } = useDemo()
  const { uid } = useSupabaseAuth()
  const today = useCivilToday()

  const items = shallowRef<Loans>({})
  const scheduleOverrides = shallowRef<LoanScheduleOverrides>({})

  let loansWatch: AbortController | null = null
  let overridesWatch: AbortController | null = null

  const persistItems = createDebouncedPersist<Loans>(STORAGE_KEYS.loans)
  const persistOverrides = createDebouncedPersist<LoanScheduleOverrides>(STORAGE_KEYS.loanScheduleOverrides)

  const isLoaded = ref(false)

  function cache() {
    if (isDemo.value) {
      persistItems(items.value)
      persistOverrides(scheduleOverrides.value)
    }
    else {
      persistStoreCache('loans', { items: items.value, scheduleOverrides: scheduleOverrides.value } satisfies LoansCache)
    }
  }

  function setLoans(values: Loans) {
    items.value = values
    cache()
  }

  function setScheduleOverrides(values: LoanScheduleOverrides) {
    scheduleOverrides.value = values
    cache()
  }

  /** Cold-start paint from the per-user snapshot before the SQLite watch emits. See wallets store. */
  function primeFromCache(data: LoansCache | null): void {
    // After the watch emitted, the snapshot is older than SQLite and would resurrect deleted loans.
    if (isDemo.value || !data || isLoaded.value)
      return
    if (!Object.keys(items.value).length)
      items.value = data.items ?? {}
    if (!Object.keys(scheduleOverrides.value).length)
      scheduleOverrides.value = data.scheduleOverrides ?? {}
  }

  function initLoans(): void {
    if (isDemo.value)
      return
    loansWatch?.abort()
    overridesWatch?.abort()
    isLoaded.value = false
    loansWatch = watchTable<Row>('SELECT * FROM loans', [], (rows) => {
      isLoaded.value = true
      const next = reconcileRows(items.value, rows, rowToLoan) ?? {}
      if (next !== items.value)
        setLoans(next)
    })
    overridesWatch = watchTable<Row>('SELECT * FROM loan_schedule_overrides', [], (rows) => {
      const next = reconcileRows(scheduleOverrides.value, rows, rowToLoanScheduleOverride) ?? {}
      if (next !== scheduleOverrides.value)
        setScheduleOverrides(next)
    })
    logger.log('watching loans')
  }

  const creditWalletIds = computed(() => new Set(
    Object.entries(walletsStore.items ?? {})
      .filter(([, wallet]) => isCreditProduct(wallet?.type))
      .map(([id]) => id),
  ))

  const loanIdByWalletId = computed(() => new Map<WalletId, LoanId>(
    Object.entries(items.value).map(([id, loan]) => [loan.walletId, id]),
  ))

  const trnsByCreditWallet = computed<Map<WalletId, LoanTrn[]>>(
    () => collectCreditTrns(trnsStore.items ?? {}, creditWalletIds.value),
  )

  // Own computed so each loan's override list keeps its reference across trn edits (memo key).
  const overridesByLoanId = computed(() => overridesByLoan(scheduleOverrides.value))
  const deriveLoanMemo = createDeriveLoanMemo()

  /** Stored row ids per loan, keyed by payment number: the rows a wallet section can reset. */
  const scheduleOverrideIdsByLoanId = computed(() => {
    const result = new Map<LoanId, Map<number, LoanScheduleOverrideId>>()
    for (const [id, row] of Object.entries(scheduleOverrides.value)) {
      const ids = result.get(row.loanId) ?? new Map<number, LoanScheduleOverrideId>()
      ids.set(row.paymentNumber, id)
      result.set(row.loanId, ids)
    }
    return result
  })

  // The previous entry is reused while its loan and memoized summary are unchanged, so readers of
  // one wallet's entry do not recompute on every unrelated trn edit.
  const byWalletId = computed<Map<WalletId, { loan: LoanItem, summary: LoanSummary }>>((prev) => {
    deriveLoanMemo.prune(new Set(Object.keys(items.value)))
    // A loan whose wallet stopped being a credit product has no trns collected: skip, not "overdue".
    return new Map(Object.entries(items.value).filter(([, loan]) => creditWalletIds.value.has(loan.walletId)).map(([loanId, loan]) => {
      const summary = deriveLoanMemo(
        loanId,
        loan,
        overridesByLoanId.value.get(loanId) ?? NO_OVERRIDES,
        trnsByCreditWallet.value.get(loan.walletId) ?? [],
        walletsStore.itemsComputed[loan.walletId]?.amount ?? 0,
        today.value,
        bankReportsStore.items[loan.walletId],
      )
      const old = prev?.get(loan.walletId)
      return [loan.walletId, old?.loan === loan && old.summary === summary ? old : { loan, summary }]
    }))
  })

  /** Interest and fees of every credit wallet, including the revolving ones with no `loans` row. */
  const costByWalletId = computed<Map<WalletId, LoanCost>>(() => new Map(
    [...creditWalletIds.value].map(walletId => [walletId, costOf(trnsByCreditWallet.value.get(walletId) ?? [])]),
  ))

  /** One minimum-payment line per credit wallet; the card line, sections and totals all read it. */
  const minPaymentByWalletId = computed(() => new Map([...creditWalletIds.value].flatMap((walletId) => {
    const wallet = walletsStore.items?.[walletId]
    const found = wallet && minPaymentOf(wallet, bankReportsStore.items[walletId], trnsByCreditWallet.value.get(walletId) ?? [], today.value)
    return found ? [[walletId, found] as const] : []
  })))

  const graceByWalletId = computed(() => new Map([...creditWalletIds.value].flatMap((walletId) => {
    const wallet = walletsStore.items?.[walletId]
    const found = wallet && graceOf(wallet, bankReportsStore.items[walletId], trnsByCreditWallet.value.get(walletId) ?? [], today.value)
    return found ? [[walletId, found] as const] : []
  })))

  const upcoming = computed(() => deriveUpcoming(
    [...byWalletId.value].map(([walletId, { loan, summary }]) => ({ currency: walletsStore.currencyOf(walletId), loan, summary, walletId })),
    [...creditWalletIds.value].flatMap((walletId) => {
      const wallet = walletsStore.items?.[walletId]
      return wallet?.type === 'credit_card' && !wallet.isArchived && !loanIdByWalletId.value.has(walletId)
        ? [{ currency: wallet.currencyCode, grace: graceByWalletId.value.get(walletId) ?? null, minPayment: minPaymentByWalletId.value.get(walletId) ?? null, walletId }]
        : []
    }),
    today.value,
  ))

  const urgentIds = computed(() => urgentWalletIds(upcoming.value, today.value))

  const dueThisMonth = computed<{ amount: number, nearestDate: number } | null>(() => {
    const revolving: { currency: CurrencyCode, minPaymentAmount: number, minPaymentDate: number, walletId: WalletId }[] = []

    for (const walletId of creditWalletIds.value) {
      if (loanIdByWalletId.value.has(walletId))
        continue
      const wallet = walletsStore.items?.[walletId]
      if (wallet?.type !== 'credit_card')
        continue
      const report: BankReport | undefined = bankReportsStore.items[walletId]
      // An overdue interest-free repayment counts like an overdue loan row, in place of a smaller minimum.
      const grace = graceByWalletId.value.get(walletId)
      if (grace?.status === 'overdue' && grace.date != null && grace.amount > (report?.minPaymentAmount ?? 0)) {
        revolving.push({ currency: wallet.currencyCode, minPaymentAmount: grace.amount, minPaymentDate: grace.date, walletId })
        continue
      }
      if (!report?.minPaymentAmount || report.minPaymentDueDate === undefined)
        continue
      // A minimum already met this period is nothing left to pay.
      if (minPaymentByWalletId.value.get(walletId)?.status === 'paid')
        continue
      revolving.push({ currency: wallet.currencyCode, minPaymentAmount: report.minPaymentAmount, minPaymentDate: report.minPaymentDueDate, walletId })
    }

    return deriveDue(
      [...byWalletId.value].map(([walletId, { summary }]) => ({
        currency: walletsStore.currencyOf(walletId),
        summary,
        walletId,
      })),
      revolving,
      today.value,
      currenciesStore.toBase,
    )
  })

  function saveLoan(id: LoanId, values: LoanItem) {
    if (!loanItemSchema.safeParse(values).success) {
      logger.error('saveLoan: invalid loan', values)
      return
    }
    const prev = items.value
    setLoans({ ...items.value, [id]: values })
    if (isDemo.value)
      return

    void persistOptimistic(upsertRow('loans', id, loanToRow(values, resolveWriteUid(uid.value))), {
      errorKey: 'loans.errors.saveFailed',
      label: 'saveLoan',
      logger,
      rollback: () => setLoans(prev),
    })
  }

  function deleteLoan(id: LoanId) {
    const prevLoans = items.value
    const prevRows = scheduleOverrides.value
    const loans = { ...items.value }
    delete loans[id]
    setLoans(loans)

    const ownRowIds = Object.keys(scheduleOverrides.value).filter(rowId => scheduleOverrides.value[rowId]?.loanId === id)
    if (ownRowIds.length) {
      const rows = { ...scheduleOverrides.value }
      for (const rowId of ownRowIds)
        delete rows[rowId]
      setScheduleOverrides(rows)
    }

    if (isDemo.value)
      return

    void persistOptimistic(Promise.all([deleteRow('loans', id), deleteRows('loan_schedule_overrides', ownRowIds)]), {
      errorKey: 'loans.errors.deleteFailed',
      label: 'deleteLoan',
      logger,
      rollback: () => {
        setLoans(prevLoans)
        setScheduleOverrides(prevRows)
      },
    })
  }

  function saveScheduleOverride(id: LoanScheduleOverrideId, values: LoanScheduleOverrideItem) {
    if (!loanScheduleOverrideSchema.safeParse(values).success) {
      logger.error('saveScheduleOverride: invalid row', values)
      return
    }
    const prev = scheduleOverrides.value
    setScheduleOverrides({ ...scheduleOverrides.value, [id]: values })
    if (isDemo.value)
      return

    void persistOptimistic(upsertRow('loan_schedule_overrides', id, loanScheduleOverrideToRow(values, resolveWriteUid(uid.value))), {
      errorKey: 'loans.errors.saveFailed',
      label: 'saveScheduleOverride',
      logger,
      rollback: () => setScheduleOverrides(prev),
    })
  }

  function deleteScheduleOverride(id: LoanScheduleOverrideId) {
    const prev = scheduleOverrides.value
    const rows = { ...scheduleOverrides.value }
    delete rows[id]
    setScheduleOverrides(rows)
    if (isDemo.value)
      return

    void persistOptimistic(deleteRow('loan_schedule_overrides', id), {
      errorKey: 'loans.errors.deleteFailed',
      label: 'deleteScheduleOverride',
      logger,
      rollback: () => setScheduleOverrides(prev),
    })
  }

  function getWhatIf(walletId: WalletId, extra: number, mode: PrepaymentMode): WhatIfResult | null {
    const entry = byWalletId.value.get(walletId)
    const params = entry && projectionParams(entry.loan, entry.summary)
    if (!entry || !params)
      return null
    return whatIf(params, entry.summary.rows, extra, mode)
  }

  return {
    byWalletId,
    costByWalletId,
    deleteLoan,
    deleteScheduleOverride,
    dueThisMonth,
    getWhatIf,
    graceByWalletId,
    initLoans,
    items,
    loanIdByWalletId,
    minPaymentByWalletId,
    primeFromCache,
    saveLoan,
    saveScheduleOverride,
    scheduleOverrideIdsByLoanId,
    scheduleOverrides,
    setLoans,
    setScheduleOverrides,
    trnsByCreditWallet,
    upcoming,
    urgentIds,
  }
})
