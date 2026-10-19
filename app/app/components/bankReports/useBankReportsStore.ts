import type { Row } from '~~/services/powersync/transforms'

import localforage from 'localforage'
import { defineStore } from 'pinia'
import { watchTable } from '~~/services/powersync/db'
import { deleteRow, upsertRow } from '~~/services/powersync/mutations'
import { bankReportToRow, rowToBankReport } from '~~/services/powersync/transforms'

import type { BankReport, BankReports } from '~/components/bankReports/types'
import type { WalletId } from '~/components/wallets/types'

import { bankReportSchema } from '~/components/bankReports/types'
import { useDemo } from '~/components/demo/useDemo'
import { parseValidEntries } from '~/components/loans/types'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { reconcileRows } from '~/components/trns/reconcile'
import { resolveWriteUid } from '~/composables/useAuthSession'
import { persistStoreCache } from '~/composables/useStoreCache'
import { createDebouncedPersist, persistOptimistic } from '~/composables/useStoreSync'
import { useSupabaseAuth } from '~/composables/useSupabase'
import { createLogger } from '~/utils/logger'

const logger = createLogger('bankReports')

/** The bank's latest figures per wallet (id = wallet id); readers fall back to their own calculation when one is absent. */
export const useBankReportsStore = defineStore('bankReports', () => {
  const { isDemo } = useDemo()
  const { uid } = useSupabaseAuth()

  const items = shallowRef<BankReports>({})
  const isLoaded = ref(false)
  const persistDemo = createDebouncedPersist<BankReports>(STORAGE_KEYS.bankReports)
  let watchController: AbortController | null = null

  function setBankReports(values: BankReports) {
    items.value = values
    if (isDemo.value)
      persistDemo(values)
    else
      persistStoreCache('bankReports', values)
  }

  /** Cold-start paint from the per-user snapshot before the SQLite watch emits. */
  function primeFromCache(data: BankReports | null): void {
    if (isDemo.value || !data || isLoaded.value)
      return
    items.value = data
  }

  async function initBankReports(): Promise<void> {
    if (isDemo.value) {
      items.value = parseValidEntries(bankReportSchema, await localforage.getItem(STORAGE_KEYS.bankReports))
      return
    }
    watchController?.abort()
    isLoaded.value = false
    watchController = watchTable<Row>('SELECT * FROM bank_reports', [], (rows) => {
      isLoaded.value = true
      const next = reconcileRows(items.value, rows, rowToBankReport) ?? {}
      if (next !== items.value)
        setBankReports(next)
    })
    logger.log('watching bank reports')
  }

  function saveBankReport(walletId: WalletId, values: BankReport) {
    const prev = items.value
    const report = { ...values, createdAt: prev[walletId]?.createdAt ?? values.createdAt, updatedAt: Date.now() }
    setBankReports({ ...prev, [walletId]: report })
    if (isDemo.value)
      return
    void persistOptimistic(upsertRow('bank_reports', walletId, bankReportToRow(report, resolveWriteUid(uid.value))), {
      errorKey: 'wallets.errors.saveFailed',
      label: 'saveBankReport',
      logger,
      rollback: () => setBankReports(prev),
    })
  }

  /** Called with the wallet: a deleted wallet takes its bank figures with it. */
  function deleteBankReport(walletId: WalletId) {
    const prev = items.value
    if (!prev[walletId])
      return
    const { [walletId]: _, ...rest } = prev
    setBankReports(rest)
    if (isDemo.value)
      return
    void persistOptimistic(deleteRow('bank_reports', walletId), {
      errorKey: 'wallets.errors.saveFailed',
      label: 'deleteBankReport',
      logger,
      rollback: () => setBankReports(prev),
    })
  }

  return { deleteBankReport, initBankReports, isLoaded, items, primeFromCache, saveBankReport, setBankReports }
})
