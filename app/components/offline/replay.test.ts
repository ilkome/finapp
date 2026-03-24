import { describe, expect, it, vi, beforeEach } from 'vitest'

import type { OfflineOp } from '~/components/offline/types'

import { OfflineEntityType } from '~/components/offline/types'

// --- Mocks ---

const mockClearOfflineQueue = vi.fn(() => Promise.resolve())
const mockGetAllOfflineOps = vi.fn((): Promise<OfflineOp[]> => Promise.resolve([]))
const mockGetQueueUserId = vi.fn((): Promise<string | null> => Promise.resolve(null))
const mockRemoveOfflineOp = vi.fn(() => Promise.resolve())
const mockSetOfflineQueueUserId = vi.fn()
const mockSetQueueUserId = vi.fn(() => Promise.resolve())

vi.mock('~/components/offline/helpers', () => ({
  clearOfflineQueue: (...args: unknown[]) => mockClearOfflineQueue(...args),
  getAllOfflineOps: (...args: unknown[]) => mockGetAllOfflineOps(...args),
  getQueueUserId: (...args: unknown[]) => mockGetQueueUserId(...args),
  removeOfflineOp: (...args: unknown[]) => mockRemoveOfflineOp(...args),
  setOfflineQueueUserId: (...args: unknown[]) => mockSetOfflineQueueUserId(...args),
  setQueueUserId: (...args: unknown[]) => mockSetQueueUserId(...args),
}))

const mockReplayWalletOps = vi.fn(() => Promise.resolve())
const mockReplayCategoryOps = vi.fn(() => Promise.resolve())
const mockReplayTrnOps = vi.fn((): Promise<number> => Promise.resolve(0))
const mockReplaySettingsOps = vi.fn(() => Promise.resolve())
const mockGroupOpsByEntity = vi.fn(() => ({
  categoryOps: [] as OfflineOp[],
  settingsOps: [] as OfflineOp[],
  trnOps: [] as OfflineOp[],
  walletOps: [] as OfflineOp[],
}))

vi.mock('~/components/offline/replayHelpers', () => ({
  groupOpsByEntity: (...args: unknown[]) => mockGroupOpsByEntity(...args),
  replayCategoryOps: (...args: unknown[]) => mockReplayCategoryOps(...args),
  replaySettingsOps: (...args: unknown[]) => mockReplaySettingsOps(...args),
  replayTrnOps: (...args: unknown[]) => mockReplayTrnOps(...args),
  replayWalletOps: (...args: unknown[]) => mockReplayWalletOps(...args),
}))

let mockUid: string | null = 'user1'

vi.mock('~/components/wallets/useWalletsStore', () => ({
  useWalletsStore: () => ({ deleteWallet: vi.fn(), items: { w1: {} }, saveWallet: vi.fn() }),
}))

vi.mock('~/components/categories/useCategoriesStore', () => ({
  useCategoriesStore: () => ({ deleteCategory: vi.fn(), items: { c1: {} }, saveCategory: vi.fn() }),
}))

vi.mock('~/components/trns/useTrnsStore', () => ({
  useTrnsStore: () => ({ deleteTrn: vi.fn(), removeTrnsFromStore: vi.fn(), saveTrn: vi.fn() }),
}))

vi.mock('~/components/user/useUserStore', () => ({
  useUserStore: () => ({
    get uid() { return mockUid },
    saveUserBaseCurrency: vi.fn(),
    saveUserLocale: vi.fn(),
  }),
}))

const mockShowWarningToast = vi.fn()
vi.mock('~/composables/useStoreSync', () => ({
  showWarningToast: (...args: unknown[]) => mockShowWarningToast(...args),
}))

vi.mock('~/utils/logger', () => ({
  createLogger: () => ({ error: vi.fn(), log: vi.fn(), warn: vi.fn() }),
}))

vi.mock('~/utils/convexId', () => ({
  isLocalId: (id: string) => id.startsWith('local_'),
}))

function makeOp(entity: OfflineOp['entity'], id: string, type: OfflineOp['type'] = 'create', data?: Record<string, unknown>): OfflineOp {
  return { data, entity, id, timestamp: Date.now(), type }
}

// Import once - _isReplaying resets via finally block after each test
import { isReplaying, replayOfflineQueue } from './replay'

beforeEach(() => {
  vi.clearAllMocks()
  mockUid = 'user1'
  mockGetQueueUserId.mockResolvedValue(null)
  mockGetAllOfflineOps.mockResolvedValue([])
  mockReplayTrnOps.mockResolvedValue(0)
  mockReplayWalletOps.mockResolvedValue(undefined)
  mockReplayCategoryOps.mockResolvedValue(undefined)
  mockReplaySettingsOps.mockResolvedValue(undefined)
  mockGroupOpsByEntity.mockReturnValue({
    categoryOps: [],
    settingsOps: [],
    trnOps: [],
    walletOps: [],
  })
})

describe('replayOfflineQueue', () => {
  it('does nothing when queue is empty', async () => {
    await replayOfflineQueue()

    expect(mockGetAllOfflineOps).toHaveBeenCalled()
    expect(mockReplayWalletOps).not.toHaveBeenCalled()
    expect(mockReplayCategoryOps).not.toHaveBeenCalled()
    expect(mockReplayTrnOps).not.toHaveBeenCalled()
  })

  it('clears queue if it belongs to another user', async () => {
    mockGetQueueUserId.mockResolvedValue('other-user')

    await replayOfflineQueue()

    expect(mockClearOfflineQueue).toHaveBeenCalled()
    expect(mockGetAllOfflineOps).not.toHaveBeenCalled()
  })

  it('sets queue ownership for current user', async () => {
    await replayOfflineQueue()

    expect(mockSetOfflineQueueUserId).toHaveBeenCalledWith('user1')
    expect(mockSetQueueUserId).toHaveBeenCalledWith('user1')
  })

  it('does not set ownership when no current user', async () => {
    mockUid = null

    await replayOfflineQueue()

    expect(mockSetOfflineQueueUserId).not.toHaveBeenCalled()
    expect(mockSetQueueUserId).not.toHaveBeenCalled()
  })

  it('proceeds when queue belongs to current user', async () => {
    mockGetQueueUserId.mockResolvedValue('user1')
    mockGetAllOfflineOps.mockResolvedValue([
      makeOp(OfflineEntityType.Wallets, 'w1', 'create'),
    ])

    await replayOfflineQueue()

    expect(mockReplayWalletOps).toHaveBeenCalled()
  })

  it('filters out frontend-ID delete ops', async () => {
    const realOp = makeOp(OfflineEntityType.Wallets, 'real_w2', 'create', { name: 'Cash' })
    mockGetAllOfflineOps.mockResolvedValue([
      makeOp(OfflineEntityType.Wallets, 'local_w1', 'delete'),
      realOp,
    ])

    await replayOfflineQueue()

    expect(mockRemoveOfflineOp).toHaveBeenCalledWith(OfflineEntityType.Wallets, 'local_w1')
    expect(mockGroupOpsByEntity).toHaveBeenCalledWith([realOp])
  })

  it('replays phases in order: wallets -> categories -> trns -> settings', async () => {
    const callOrder: string[] = []
    mockReplayWalletOps.mockImplementation(async () => { callOrder.push('wallets') })
    mockReplayCategoryOps.mockImplementation(async () => { callOrder.push('categories') })
    mockReplayTrnOps.mockImplementation(async () => { callOrder.push('trns'); return 0 })
    mockReplaySettingsOps.mockImplementation(async () => { callOrder.push('settings') })

    mockGetAllOfflineOps.mockResolvedValue([
      makeOp(OfflineEntityType.Wallets, 'w1', 'create'),
    ])
    mockGroupOpsByEntity.mockReturnValue({
      categoryOps: [makeOp(OfflineEntityType.Categories, 'c1', 'create')],
      settingsOps: [makeOp(OfflineEntityType.UserSettings, 's1', 'update')],
      trnOps: [makeOp(OfflineEntityType.Trns, 't1', 'create')],
      walletOps: [makeOp(OfflineEntityType.Wallets, 'w1', 'create')],
    })

    await replayOfflineQueue()

    expect(callOrder).toEqual(['wallets', 'categories', 'trns', 'settings'])
  })

  it('resets isReplaying after success', async () => {
    mockGetAllOfflineOps.mockResolvedValue([
      makeOp(OfflineEntityType.Wallets, 'w1', 'create'),
    ])

    await replayOfflineQueue()

    expect(isReplaying()).toBe(false)
  })

  it('resets isReplaying after error', async () => {
    mockGetAllOfflineOps.mockResolvedValue([
      makeOp(OfflineEntityType.Wallets, 'w1', 'create'),
    ])
    mockReplayWalletOps.mockRejectedValueOnce(new Error('network'))

    await expect(replayOfflineQueue()).rejects.toThrow('network')

    expect(isReplaying()).toBe(false)
  })

  it('clears queue on ownership check error', async () => {
    mockGetQueueUserId.mockRejectedValueOnce(new Error('storage error'))

    await replayOfflineQueue()

    expect(mockClearOfflineQueue).toHaveBeenCalled()
    expect(mockGetAllOfflineOps).not.toHaveBeenCalled()
  })

  it('shows warning toast when orphaned trns exist', async () => {
    mockGetAllOfflineOps.mockResolvedValue([
      makeOp(OfflineEntityType.Trns, 't1', 'create'),
    ])
    mockGroupOpsByEntity.mockReturnValue({
      categoryOps: [],
      settingsOps: [],
      trnOps: [makeOp(OfflineEntityType.Trns, 't1', 'create')],
      walletOps: [],
    })
    mockReplayTrnOps.mockResolvedValue(3)

    await replayOfflineQueue()

    expect(mockShowWarningToast).toHaveBeenCalledWith('trns.errors.orphanedSkipped', { count: 3 })
  })

  it('does not show toast when no orphans', async () => {
    mockGetAllOfflineOps.mockResolvedValue([
      makeOp(OfflineEntityType.Trns, 't1', 'create'),
    ])
    mockGroupOpsByEntity.mockReturnValue({
      categoryOps: [],
      settingsOps: [],
      trnOps: [makeOp(OfflineEntityType.Trns, 't1', 'create')],
      walletOps: [],
    })
    mockReplayTrnOps.mockResolvedValue(0)

    await replayOfflineQueue()

    expect(mockShowWarningToast).not.toHaveBeenCalled()
  })
})

describe('isReplaying', () => {
  it('returns false when not replaying', () => {
    expect(isReplaying()).toBe(false)
  })
})
