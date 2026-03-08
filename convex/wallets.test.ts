import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api, internal } from './_generated/api'
import schema from './schema'
import { modules, setMockUser } from './test-utils/setup'

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

    it('creates with optional fields', async () => {
      const t = convexTest(schema, modules)
      await t.mutation(api.wallets.create, {
        ...validWallet,
        creditLimit: 5000,
        desc: 'My wallet',
        isArchived: true,
        isWithdrawal: true,
        type: 'credit',
      })

      const wallets = await t.query(api.wallets.list)
      expect(wallets![0]).toMatchObject({
        creditLimit: 5000,
        desc: 'My wallet',
        isArchived: true,
        isWithdrawal: true,
        type: 'credit',
      })
    })

    it('throws for empty name', async () => {
      const t = convexTest(schema, modules)
      await expect(
        t.mutation(api.wallets.create, { ...validWallet, name: '  ' }),
      ).rejects.toThrow('Name is required')
    })

    it('throws for empty color', async () => {
      const t = convexTest(schema, modules)
      await expect(
        t.mutation(api.wallets.create, { ...validWallet, color: '' }),
      ).rejects.toThrow('Color is required')
    })

    it('throws for empty currency', async () => {
      const t = convexTest(schema, modules)
      await expect(
        t.mutation(api.wallets.create, { ...validWallet, currency: '' }),
      ).rejects.toThrow('Currency is required')
    })

    it('throws for name exceeding 100 chars', async () => {
      const t = convexTest(schema, modules)
      await expect(
        t.mutation(api.wallets.create, { ...validWallet, name: 'a'.repeat(101) }),
      ).rejects.toThrow('Name must be at most 100 characters')
    })

    it('throws for credit limit exceeding max', async () => {
      const t = convexTest(schema, modules)
      await expect(
        t.mutation(api.wallets.create, { ...validWallet, creditLimit: 2_000_000_000 }),
      ).rejects.toThrow('Credit limit must be between')
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
      await t.mutation(api.wallets.update, { id, name: 'Updated', color: '#00ff00' })

      const wallets = await t.query(api.wallets.list)
      expect(wallets![0]).toMatchObject({ name: 'Updated', color: '#00ff00' })
    })

    it('throws for wallet owned by another user', async () => {
      const t = convexTest(schema, modules)
      const id = await t.mutation(api.wallets.create, validWallet)

      setMockUser('other-user')
      await expect(
        t.mutation(api.wallets.update, { id, name: 'Hack' }),
      ).rejects.toThrow('Not found')
    })

    it('throws for empty name on update', async () => {
      const t = convexTest(schema, modules)
      const id = await t.mutation(api.wallets.create, validWallet)
      await expect(
        t.mutation(api.wallets.update, { id, name: ' ' }),
      ).rejects.toThrow('Name is required')
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

    it('throws for wallet owned by another user', async () => {
      const t = convexTest(schema, modules)
      const id = await t.mutation(api.wallets.create, validWallet)

      setMockUser('other-user')
      await expect(
        t.mutation(api.wallets.updateOrder, { orders: [{ id, order: 5 }] }),
      ).rejects.toThrow('Not found')
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

      // Create a category for the trn
      const catId = await t.mutation(api.categories.create, {
        color: '#000', icon: 'food', name: 'Food',
        showInLastUsed: true, showInQuickSelector: true,
      })

      // Create trn referencing this wallet
      await t.mutation(api.trns.create, {
        amount: 100, categoryId: catId, date: Date.now(),
        type: 0, walletId,
      })

      // Verify trn exists
      const trnsBefore = await t.query(api.trns.list, { paginationOpts: { cursor: null, numItems: 10 } })
      expect(trnsBefore!.page).toHaveLength(1)

      // Remove wallet (cascade action)
      await t.action(api.wallets.remove, { id: walletId })

      // Wallet gone
      const wallets = await t.query(api.wallets.list)
      expect(wallets).toHaveLength(0)

      // Trn gone too
      const trnsAfter = await t.query(api.trns.list, { paginationOpts: { cursor: null, numItems: 10 } })
      expect(trnsAfter!.page).toHaveLength(0)
    })
  })
})
