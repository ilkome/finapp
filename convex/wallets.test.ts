import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'
import { modules, setMockUser } from './test_utils/setup.helper'

const validWallet = {
  color: '#ff0000',
  currency: 'USD',
  name: 'Cash',
  order: 0,
  type: 'cash' as const,
}

describe('convex/wallets', () => {
  describe('create', () => {
    it('creates a wallet with defaults', async () => {
      const t = convexTest(schema, modules)
      const id = await t.mutation(api.wallets.create, validWallet)

      const wallets = await t.query(api.wallets.list)
      expect(wallets).toHaveLength(1)
      expect(wallets![0]).toMatchObject({
        ...validWallet,
        _id: id,
        isArchived: false,
        isExcludeInTotal: false,
        isWithdrawal: false,
        userId: 'test-user-id',
      })
    })

    it('throws for empty name', async () => {
      const t = convexTest(schema, modules)
      await expect(
        t.mutation(api.wallets.create, { ...validWallet, name: '  ' }),
      ).rejects.toThrow('Name is required')
    })

    it('throws for unauthenticated user', async () => {
      const t = convexTest(schema, modules)
      setMockUser(null)
      await expect(
        t.mutation(api.wallets.create, validWallet),
      ).rejects.toThrow('Unauthorized')
    })
  })

  describe('update', () => {
    it('updates wallet fields', async () => {
      const t = convexTest(schema, modules)
      const id = await t.mutation(api.wallets.create, validWallet)
      await t.mutation(api.wallets.update, { color: '#00ff00', id, name: 'Updated' })

      const wallets = await t.query(api.wallets.list)
      expect(wallets![0]).toMatchObject({ color: '#00ff00', name: 'Updated' })
    })

    it('throws for wallet owned by another user', async () => {
      const t = convexTest(schema, modules)
      const id = await t.mutation(api.wallets.create, validWallet)

      setMockUser('other-user')
      await expect(
        t.mutation(api.wallets.update, { id, name: 'Hack' }),
      ).rejects.toThrow('Not found')
    })
  })

  describe('updateOrder', () => {
    it('reorders wallets', async () => {
      const t = convexTest(schema, modules)
      const id1 = await t.mutation(api.wallets.create, { ...validWallet, order: 0 })
      const id2 = await t.mutation(api.wallets.create, { ...validWallet, name: 'Card', order: 1 })

      await t.mutation(api.wallets.updateOrder, {
        orders: [{ id: id1, order: 1 }, { id: id2, order: 0 }],
      })

      const wallets = await t.query(api.wallets.list)
      const w1 = wallets!.find(w => w._id === id1)!
      const w2 = wallets!.find(w => w._id === id2)!
      expect(w1.order).toBe(1)
      expect(w2.order).toBe(0)
    })
  })

  describe('list', () => {
    it('returns null for unauthenticated user', async () => {
      const t = convexTest(schema, modules)
      setMockUser(null)
      expect(await t.query(api.wallets.list)).toBeNull()
    })

    it('returns only own wallets', async () => {
      const t = convexTest(schema, modules)
      await t.mutation(api.wallets.create, validWallet)

      setMockUser('other-user')
      await t.mutation(api.wallets.create, { ...validWallet, name: 'Other' })

      const otherWallets = await t.query(api.wallets.list)
      expect(otherWallets).toHaveLength(1)
      expect(otherWallets![0].name).toBe('Other')
    })
  })

  describe('remove (cascade)', () => {
    it('deletes wallet and its transactions', async () => {
      const t = convexTest(schema, modules)
      const walletId = await t.mutation(api.wallets.create, validWallet)

      const catId = await t.mutation(api.categories.create, {
        color: '#000',
        icon: 'food',
        name: 'Food',
        showInLastUsed: true,
        showInQuickSelector: true,
      })

      await t.mutation(api.trns.create, {
        amount: 100,
        categoryId: catId,
        date: Date.now(),
        type: 0,
        walletId,
      })

      await t.action(api.wallets.remove, { id: walletId })

      expect(await t.query(api.wallets.list)).toHaveLength(0)
      const trns = await t.query(api.trns.list, { paginationOpts: { cursor: null, numItems: 10 } })
      expect(trns!.page).toHaveLength(0)
    })
  })
})
