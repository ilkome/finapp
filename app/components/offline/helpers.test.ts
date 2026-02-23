import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  clearOfflineQueue,
  getAllOfflineOps,
  getOfflineOpsByEntity,
  pushOfflineOp,
  removeOfflineOp,
  removeOfflineOpByType,
} from '~/components/offline/helpers'

// Mock localforage
const store = new Map<string, any>()

vi.mock('localforage', () => ({
  default: {
    getItem: vi.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    removeItem: vi.fn((key: string) => {
      store.delete(key)
      return Promise.resolve()
    }),
    setItem: vi.fn((key: string, value: any) => {
      store.set(key, value)
      return Promise.resolve()
    }),
  },
}))

beforeEach(() => {
  store.clear()
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('pushOfflineOp', () => {
  it('adds operation to empty queue', async () => {
    await pushOfflineOp({ data: { amount: 100 }, entity: 'trns', id: 'trn1', type: 'create' })

    const queue = await getAllOfflineOps()
    expect(queue).toHaveLength(1)
    expect(queue[0]).toMatchObject({ data: { amount: 100 }, entity: 'trns', id: 'trn1', type: 'create' })
    expect(queue[0].timestamp).toBeGreaterThan(0)
  })

  it('appends operations for different entities', async () => {
    await pushOfflineOp({ data: { name: 'Cash' }, entity: 'wallets', id: 'w1', type: 'create' })
    await pushOfflineOp({ data: { amount: 100 }, entity: 'trns', id: 'trn1', type: 'create' })

    const queue = await getAllOfflineOps()
    expect(queue).toHaveLength(2)
  })

  describe('collapsing rules', () => {
    it('create + update → create with merged data', async () => {
      await pushOfflineOp({ data: { name: 'Cash' }, entity: 'wallets', id: 'w1', type: 'create' })
      await pushOfflineOp({ data: { name: 'Cash Updated' }, entity: 'wallets', id: 'w1', type: 'update' })

      const queue = await getAllOfflineOps()
      expect(queue).toHaveLength(1)
      expect(queue[0].type).toBe('create')
      expect(queue[0].data).toEqual({ name: 'Cash Updated' })
    })

    it('create + delete → both removed', async () => {
      await pushOfflineOp({ data: { name: 'Cash' }, entity: 'wallets', id: 'w1', type: 'create' })
      await pushOfflineOp({ entity: 'wallets', id: 'w1', type: 'delete' })

      const queue = await getAllOfflineOps()
      expect(queue).toHaveLength(0)
    })

    it('update + update → update with merged data', async () => {
      await pushOfflineOp({ data: { name: 'Old' }, entity: 'wallets', id: 'w1', type: 'update' })
      await pushOfflineOp({ data: { name: 'New' }, entity: 'wallets', id: 'w1', type: 'update' })

      const queue = await getAllOfflineOps()
      expect(queue).toHaveLength(1)
      expect(queue[0].type).toBe('update')
      expect(queue[0].data).toEqual({ name: 'New' })
    })

    it('update + delete → replace with delete', async () => {
      await pushOfflineOp({ data: { name: 'Cash' }, entity: 'wallets', id: 'w1', type: 'update' })
      await pushOfflineOp({ entity: 'wallets', id: 'w1', type: 'delete' })

      const queue = await getAllOfflineOps()
      expect(queue).toHaveLength(1)
      expect(queue[0].type).toBe('delete')
    })

    it('delete + any → ignores new operation', async () => {
      await pushOfflineOp({ entity: 'wallets', id: 'w1', type: 'delete' })
      await pushOfflineOp({ data: { name: 'Cash' }, entity: 'wallets', id: 'w1', type: 'create' })

      const queue = await getAllOfflineOps()
      expect(queue).toHaveLength(1)
      expect(queue[0].type).toBe('delete')
    })
  })
})

describe('removeOfflineOp', () => {
  it('removes all operations for entity+id', async () => {
    await pushOfflineOp({ data: { name: 'Cash' }, entity: 'wallets', id: 'w1', type: 'create' })
    await pushOfflineOp({ data: { amount: 100 }, entity: 'trns', id: 'trn1', type: 'create' })

    await removeOfflineOp('wallets', 'w1')

    const queue = await getAllOfflineOps()
    expect(queue).toHaveLength(1)
    expect(queue[0].entity).toBe('trns')
  })

  it('does nothing when not found', async () => {
    await pushOfflineOp({ data: { name: 'Cash' }, entity: 'wallets', id: 'w1', type: 'create' })

    await removeOfflineOp('wallets', 'w999')

    const queue = await getAllOfflineOps()
    expect(queue).toHaveLength(1)
  })
})

describe('removeOfflineOpByType', () => {
  it('removes specific operation by type', async () => {
    await pushOfflineOp({ data: { name: 'Cash' }, entity: 'wallets', id: 'w1', type: 'create' })

    await removeOfflineOpByType('wallets', 'w1', 'create')

    const queue = await getAllOfflineOps()
    expect(queue).toHaveLength(0)
  })
})

describe('getOfflineOpsByEntity', () => {
  it('filters by entity', async () => {
    await pushOfflineOp({ data: { name: 'Cash' }, entity: 'wallets', id: 'w1', type: 'create' })
    await pushOfflineOp({ data: { amount: 100 }, entity: 'trns', id: 'trn1', type: 'create' })
    await pushOfflineOp({ data: { name: 'Food' }, entity: 'categories', id: 'c1', type: 'create' })

    const walletOps = await getOfflineOpsByEntity('wallets')
    expect(walletOps).toHaveLength(1)
    expect(walletOps[0].entity).toBe('wallets')
  })

  it('returns empty array when no matching ops', async () => {
    await pushOfflineOp({ data: { amount: 100 }, entity: 'trns', id: 'trn1', type: 'create' })

    const walletOps = await getOfflineOpsByEntity('wallets')
    expect(walletOps).toHaveLength(0)
  })
})

describe('clearOfflineQueue', () => {
  it('removes all operations', async () => {
    await pushOfflineOp({ data: { name: 'Cash' }, entity: 'wallets', id: 'w1', type: 'create' })
    await pushOfflineOp({ data: { amount: 100 }, entity: 'trns', id: 'trn1', type: 'create' })

    await clearOfflineQueue()

    const queue = await getAllOfflineOps()
    expect(queue).toHaveLength(0)
  })
})

describe('cross-entity isolation', () => {
  it('different entities have separate operations', async () => {
    await pushOfflineOp({ data: { a: 1 }, entity: 'trns', id: 'id1', type: 'create' })
    await pushOfflineOp({ data: { b: 2 }, entity: 'wallets', id: 'id1', type: 'create' })

    const trnsOps = await getOfflineOpsByEntity('trns')
    const walletsOps = await getOfflineOpsByEntity('wallets')

    expect(trnsOps).toHaveLength(1)
    expect(trnsOps[0].data).toEqual({ a: 1 })
    expect(walletsOps).toHaveLength(1)
    expect(walletsOps[0].data).toEqual({ b: 2 })
  })

  it('collapsing only applies within same entity+id', async () => {
    await pushOfflineOp({ data: { a: 1 }, entity: 'trns', id: 'id1', type: 'create' })
    await pushOfflineOp({ data: { b: 2 }, entity: 'wallets', id: 'id1', type: 'create' })
    await pushOfflineOp({ entity: 'trns', id: 'id1', type: 'delete' })

    const queue = await getAllOfflineOps()
    // trns create+delete collapsed to nothing, wallets create remains
    expect(queue).toHaveLength(1)
    expect(queue[0].entity).toBe('wallets')
  })
})
