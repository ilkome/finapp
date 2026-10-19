import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useBankReportsStore } from '~/components/bankReports/useBankReportsStore'

const h = vi.hoisted(() => ({
  auth: { session: { value: null }, signOut: vi.fn(), uid: { value: 'u1' }, user: { value: null } },
  deleteRow: vi.fn(() => Promise.resolve()),
  demo: { value: false },
  upsertRow: vi.fn(() => Promise.resolve()),
  watchTable: vi.fn(() => ({ abort: vi.fn() })),
}))

vi.mock('~~/services/powersync/db', () => ({ watchTable: h.watchTable }))
vi.mock('~~/services/powersync/mutations', () => ({ deleteRow: h.deleteRow, upsertRow: h.upsertRow }))
vi.mock('~/components/demo/useDemo', () => ({ useDemo: () => ({ isDemo: h.demo }) }))
vi.mock('~/composables/useSupabase', () => ({ useSupabase: () => ({}), useSupabaseAuth: () => h.auth }))

describe('useBankReportsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('saves a report as a row keyed by the wallet id, then clears it', () => {
    const store = useBankReportsStore()
    const day = Date.UTC(2026, 9, 10)

    store.saveBankReport('w1', { balanceAmount: 25000, balanceDate: day, createdAt: 1, updatedAt: 1 })
    expect(store.items.w1).toMatchObject({ balanceAmount: 25000, balanceDate: day, createdAt: 1 })
    expect(h.upsertRow).toHaveBeenCalledWith('bank_reports', 'w1', expect.objectContaining({ balance_amount: 25000 }))

    store.deleteBankReport('w1')
    expect(store.items.w1).toBeUndefined()
    expect(h.deleteRow).toHaveBeenCalledWith('bank_reports', 'w1')
  })
})
