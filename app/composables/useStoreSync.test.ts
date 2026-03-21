import localforage from 'localforage'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { OfflineOp } from '~/components/offline/types'

const getOfflineOpsByEntityMock = vi.fn<() => Promise<OfflineOp[]>>().mockResolvedValue([])
const pushOfflineOpMock = vi.fn()
const removeOfflineOpMock = vi.fn().mockResolvedValue(undefined)
const removeOfflineOpsMock = vi.fn().mockResolvedValue(undefined)

vi.mock('~/components/offline/helpers', () => ({
  getOfflineOpsByEntity: (...args: unknown[]) => getOfflineOpsByEntityMock(...args as []),
  pushOfflineOp: (...args: unknown[]) => pushOfflineOpMock(...args as []),
  removeOfflineOp: (...args: unknown[]) => removeOfflineOpMock(...args as []),
  removeOfflineOps: (...args: unknown[]) => removeOfflineOpsMock(...args as []),
}))

let isReplayingValue = false
vi.mock('~/components/offline/replay', () => ({
  isReplaying: () => isReplayingValue,
}))

beforeEach(async () => {
  vi.clearAllMocks()
  isReplayingValue = false
  await localforage.clear()
})

describe('mergeOfflineOps', () => {
  it('applies pending updates and deletes on top of server data', async () => {
    const { mergeOfflineOps } = await import('~/composables/useStoreSync')

    getOfflineOpsByEntityMock.mockResolvedValueOnce([
      { data: { name: 'Updated' }, entity: 'wallets', id: 'w1', timestamp: 1, type: 'update' },
      { entity: 'wallets', id: 'w2', timestamp: 2, type: 'delete' },
    ] satisfies OfflineOp[])

    const serverData = {
      w1: { color: '#fff', name: 'Original' },
      w2: { color: '#000', name: 'ToDelete' },
      w3: { color: '#aaa', name: 'Untouched' },
    }

    const result = await mergeOfflineOps(serverData, 'wallets')

    expect(result.w1).toEqual({ name: 'Updated' })
    expect(result).not.toHaveProperty('w2')
    expect(result.w3).toEqual({ color: '#aaa', name: 'Untouched' })
  })

  it('returns data as-is when queue is empty', async () => {
    const { mergeOfflineOps } = await import('~/composables/useStoreSync')

    getOfflineOpsByEntityMock.mockResolvedValueOnce([])

    const serverData = { w1: { name: 'Cash' } }
    const result = await mergeOfflineOps(serverData, 'wallets')

    expect(result).toEqual(serverData)
  })

  it('removes stale local_ IDs not in pending queue', async () => {
    const { mergeOfflineOps } = await import('~/composables/useStoreSync')

    getOfflineOpsByEntityMock.mockResolvedValueOnce([
      { data: { name: 'New' }, entity: 'wallets', id: 'local_fresh', timestamp: 1, type: 'create' },
    ] satisfies OfflineOp[])

    const data = {
      local_fresh: { name: 'New' },
      local_stale: { name: 'Ghost' },
      server1: { name: 'Real' },
    }

    const result = await mergeOfflineOps(data, 'wallets')

    expect(result).toHaveProperty('local_fresh')
    expect(result).not.toHaveProperty('local_stale')
    expect(result).toHaveProperty('server1')
  })
})

describe('handleMutationResult', () => {
  it('remaps local_id → convexId on successful create', async () => {
    const { handleMutationResult, unblockPersist } = await import('~/composables/useStoreSync')
    unblockPersist()

    const items = shallowRef<Record<string, any> | null>({
      existing: { name: 'Card' },
      local_abc: { name: 'Cash' },
    })

    const remap = await handleMutationResult({
      action: 'create',
      entity: 'wallets',
      errorMessage: 'wallets.saveError',
      id: 'local_abc',
      items,
      mutation: Promise.resolve('convex_w1'),
    })

    expect(items.value).not.toHaveProperty('local_abc')
    expect(items.value).toHaveProperty('convex_w1')
    expect(items.value!.convex_w1).toEqual({ name: 'Cash' })
    expect(items.value).toHaveProperty('existing')
    expect(remap).toEqual({ convexId: 'convex_w1', localId: 'local_abc' })
    expect(await localforage.getItem('finapp.wallets')).toEqual(items.value)
  })

  it('skips persist when persistBlocked', async () => {
    const { blockPersist, handleMutationResult } = await import('~/composables/useStoreSync')
    blockPersist()

    const items = shallowRef<Record<string, any> | null>({
      local_abc: { name: 'Cash' },
    })

    await handleMutationResult({
      action: 'create',
      entity: 'wallets',
      errorMessage: 'wallets.saveError',
      id: 'local_abc',
      items,
      mutation: Promise.resolve('convex_w1'),
    })

    expect(items.value).toHaveProperty('convex_w1')
    expect(await localforage.getItem('finapp.wallets')).toBeNull()

    const { unblockPersist } = await import('~/composables/useStoreSync')
    unblockPersist()
  })

  it('shows error toast on mutation failure and does NOT remove offline op', async () => {
    const { handleMutationResult, unblockPersist } = await import('~/composables/useStoreSync')
    const { toastAddMock } = await import('~/test-utils/setup-store')
    unblockPersist()

    await handleMutationResult({
      action: 'update',
      entity: 'wallets',
      errorMessage: 'wallets.saveError',
      id: 'w1',
      mutation: Promise.reject(new Error('network')),
    })

    expect(toastAddMock).toHaveBeenCalledWith(
      expect.objectContaining({ color: 'error' }),
    )
    expect(removeOfflineOpMock).not.toHaveBeenCalled()
  })

  it('removes offline op on successful update (no remap)', async () => {
    const { handleMutationResult, unblockPersist } = await import('~/composables/useStoreSync')
    unblockPersist()

    const result = await handleMutationResult({
      action: 'update',
      entity: 'wallets',
      errorMessage: 'wallets.saveError',
      id: 'w1',
      mutation: Promise.resolve(undefined),
    })

    expect(removeOfflineOpMock).toHaveBeenCalledWith('wallets', 'w1')
    expect(result).toBeUndefined()
  })
})

describe('pushSaveOp', () => {
  it('does nothing in demo mode', async () => {
    const { pushSaveOp } = await import('~/composables/useStoreSync')

    const result = pushSaveOp({
      entity: 'wallets',
      id: 'w1',
      isDemo: true,
      isExisting: false,
      values: { name: 'Cash' },
    })

    expect(result).toBe(false)
    expect(pushOfflineOpMock).not.toHaveBeenCalled()
  })

  it('does not push to queue during replay', async () => {
    const { pushSaveOp } = await import('~/composables/useStoreSync')

    isReplayingValue = true

    const result = pushSaveOp({
      entity: 'wallets',
      id: 'w1',
      isDemo: false,
      isExisting: false,
      values: { name: 'Cash' },
    })

    expect(result).toBe(true)
    expect(pushOfflineOpMock).not.toHaveBeenCalled()
  })

  it('pushes create op for new entities', async () => {
    const { pushSaveOp } = await import('~/composables/useStoreSync')

    pushSaveOp({
      entity: 'wallets',
      id: 'local_abc',
      isDemo: false,
      isExisting: false,
      values: { name: 'Cash' },
    })

    expect(pushOfflineOpMock).toHaveBeenCalledWith({
      data: { name: 'Cash' },
      entity: 'wallets',
      id: 'local_abc',
      type: 'create',
    })
  })

  it('pushes update op for existing entities', async () => {
    const { pushSaveOp } = await import('~/composables/useStoreSync')

    pushSaveOp({
      entity: 'wallets',
      id: 'w1',
      isDemo: false,
      isExisting: true,
      values: { name: 'Updated' },
    })

    expect(pushOfflineOpMock).toHaveBeenCalledWith({
      data: { name: 'Updated' },
      entity: 'wallets',
      id: 'w1',
      type: 'update',
    })
  })
})

describe('pushDeleteOp', () => {
  it('does nothing in demo mode', async () => {
    const { pushDeleteOp } = await import('~/composables/useStoreSync')

    const result = pushDeleteOp({ entity: 'wallets', id: 'w1', isDemo: true })

    expect(result).toBe(false)
    expect(pushOfflineOpMock).not.toHaveBeenCalled()
  })
})
