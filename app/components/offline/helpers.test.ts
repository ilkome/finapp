import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  clearOfflineQueue,
  getAllOfflineOps,
  getOfflineOpsByEntity,
  pushOfflineOp,
  removeOfflineOp,
  removeOfflineOpByType,
} from '~/components/offline/helpers'
import { OfflineEntityType } from '~/components/offline/types'

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
    await pushOfflineOp({ data: { amount: 100 }, entity: OfflineEntityType.Trns, id: 'trn1', type: 'create' })

    const queue = await getAllOfflineOps()
    expect(queue).toHaveLength(1)
    expect(queue[0]).toMatchObject({ data: { amount: 100 }, entity: OfflineEntityType.Trns, id: 'trn1', type: 'create' })
    expect(queue[0]!.timestamp).toBeGreaterThan(0)
  })

  it('appends operations for different entities', async () => {
    await pushOfflineOp({ data: { name: 'Cash' }, entity: OfflineEntityType.Wallets, id: 'w1', type: 'create' })
    await pushOfflineOp({ data: { amount: 100 }, entity: OfflineEntityType.Trns, id: 'trn1', type: 'create' })

    const queue = await getAllOfflineOps()
    expect(queue).toHaveLength(2)
  })

  describe('collapsing rules', () => {
    it('create + update → create with merged data', async () => {
      await pushOfflineOp({ data: { name: 'Cash' }, entity: OfflineEntityType.Wallets, id: 'w1', type: 'create' })
      await pushOfflineOp({ data: { name: 'Cash Updated' }, entity: OfflineEntityType.Wallets, id: 'w1', type: 'update' })

      const queue = await getAllOfflineOps()
      expect(queue).toHaveLength(1)
      expect(queue[0]!.type).toBe('create')
      expect(queue[0]!.data).toEqual({ name: 'Cash Updated' })
    })

    it('create + delete → both removed', async () => {
      await pushOfflineOp({ data: { name: 'Cash' }, entity: OfflineEntityType.Wallets, id: 'w1', type: 'create' })
      await pushOfflineOp({ entity: OfflineEntityType.Wallets, id: 'w1', type: 'delete' })

      const queue = await getAllOfflineOps()
      expect(queue).toHaveLength(0)
    })

    it('update + update → update with merged data', async () => {
      await pushOfflineOp({ data: { name: 'Old' }, entity: OfflineEntityType.Wallets, id: 'w1', type: 'update' })
      await pushOfflineOp({ data: { name: 'New' }, entity: OfflineEntityType.Wallets, id: 'w1', type: 'update' })

      const queue = await getAllOfflineOps()
      expect(queue).toHaveLength(1)
      expect(queue[0]!.type).toBe('update')
      expect(queue[0]!.data).toEqual({ name: 'New' })
    })

    it('update + delete → replace with delete', async () => {
      await pushOfflineOp({ data: { name: 'Cash' }, entity: OfflineEntityType.Wallets, id: 'w1', type: 'update' })
      await pushOfflineOp({ entity: OfflineEntityType.Wallets, id: 'w1', type: 'delete' })

      const queue = await getAllOfflineOps()
      expect(queue).toHaveLength(1)
      expect(queue[0]!.type).toBe('delete')
    })

    it('delete + any → ignores new operation', async () => {
      await pushOfflineOp({ entity: OfflineEntityType.Wallets, id: 'w1', type: 'delete' })
      await pushOfflineOp({ data: { name: 'Cash' }, entity: OfflineEntityType.Wallets, id: 'w1', type: 'create' })

      const queue = await getAllOfflineOps()
      expect(queue).toHaveLength(1)
      expect(queue[0]!.type).toBe('delete')
    })
  })
})

describe('removeOfflineOp', () => {
  it('removes all operations for entity+id', async () => {
    await pushOfflineOp({ data: { name: 'Cash' }, entity: OfflineEntityType.Wallets, id: 'w1', type: 'create' })
    await pushOfflineOp({ data: { amount: 100 }, entity: OfflineEntityType.Trns, id: 'trn1', type: 'create' })

    await removeOfflineOp(OfflineEntityType.Wallets, 'w1')

    const queue = await getAllOfflineOps()
    expect(queue).toHaveLength(1)
    expect(queue[0]!.entity).toBe(OfflineEntityType.Trns)
  })

  it('does nothing when not found', async () => {
    await pushOfflineOp({ data: { name: 'Cash' }, entity: OfflineEntityType.Wallets, id: 'w1', type: 'create' })

    await removeOfflineOp(OfflineEntityType.Wallets, 'w999')

    const queue = await getAllOfflineOps()
    expect(queue).toHaveLength(1)
  })
})

describe('removeOfflineOpByType', () => {
  it('removes specific operation by type', async () => {
    await pushOfflineOp({ data: { name: 'Cash' }, entity: OfflineEntityType.Wallets, id: 'w1', type: 'create' })

    await removeOfflineOpByType(OfflineEntityType.Wallets, 'w1', 'create')

    const queue = await getAllOfflineOps()
    expect(queue).toHaveLength(0)
  })
})

describe('getOfflineOpsByEntity', () => {
  it('filters by entity', async () => {
    await pushOfflineOp({ data: { name: 'Cash' }, entity: OfflineEntityType.Wallets, id: 'w1', type: 'create' })
    await pushOfflineOp({ data: { amount: 100 }, entity: OfflineEntityType.Trns, id: 'trn1', type: 'create' })
    await pushOfflineOp({ data: { name: 'Food' }, entity: OfflineEntityType.Categories, id: 'c1', type: 'create' })

    const walletOps = await getOfflineOpsByEntity(OfflineEntityType.Wallets)
    expect(walletOps).toHaveLength(1)
    expect(walletOps[0]!.entity).toBe(OfflineEntityType.Wallets)
  })

  it('returns empty array when no matching ops', async () => {
    await pushOfflineOp({ data: { amount: 100 }, entity: OfflineEntityType.Trns, id: 'trn1', type: 'create' })

    const walletOps = await getOfflineOpsByEntity(OfflineEntityType.Wallets)
    expect(walletOps).toHaveLength(0)
  })
})

describe('clearOfflineQueue', () => {
  it('removes all operations', async () => {
    await pushOfflineOp({ data: { name: 'Cash' }, entity: OfflineEntityType.Wallets, id: 'w1', type: 'create' })
    await pushOfflineOp({ data: { amount: 100 }, entity: OfflineEntityType.Trns, id: 'trn1', type: 'create' })

    await clearOfflineQueue()

    const queue = await getAllOfflineOps()
    expect(queue).toHaveLength(0)
  })
})

describe('cross-entity isolation', () => {
  it('different entities have separate operations', async () => {
    await pushOfflineOp({ data: { a: 1 }, entity: OfflineEntityType.Trns, id: 'id1', type: 'create' })
    await pushOfflineOp({ data: { b: 2 }, entity: OfflineEntityType.Wallets, id: 'id1', type: 'create' })

    const trnsOps = await getOfflineOpsByEntity(OfflineEntityType.Trns)
    const walletsOps = await getOfflineOpsByEntity(OfflineEntityType.Wallets)

    expect(trnsOps).toHaveLength(1)
    expect(trnsOps[0]!.data).toEqual({ a: 1 })
    expect(walletsOps).toHaveLength(1)
    expect(walletsOps[0]!.data).toEqual({ b: 2 })
  })

  it('collapsing only applies within same entity+id', async () => {
    await pushOfflineOp({ data: { a: 1 }, entity: OfflineEntityType.Trns, id: 'id1', type: 'create' })
    await pushOfflineOp({ data: { b: 2 }, entity: OfflineEntityType.Wallets, id: 'id1', type: 'create' })
    await pushOfflineOp({ entity: OfflineEntityType.Trns, id: 'id1', type: 'delete' })

    const queue = await getAllOfflineOps()
    expect(queue).toHaveLength(1)
    expect(queue[0]!.entity).toBe(OfflineEntityType.Wallets)
  })
})
