import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'
import { modules, setMockUser } from './test_utils/setup.helper'

const validWallet = {
  color: '#000',
  currency: 'USD',
  name: 'Cash',
  order: 0,
  type: 'cash' as const,
}

const validCategory = {
  color: '#ff0000',
  icon: 'food',
  name: 'Food',
  showInLastUsed: true,
  showInQuickSelector: true,
}

async function setupWalletAndCategory(t: ReturnType<typeof convexTest>) {
  const walletId = await t.mutation(api.wallets.create, validWallet)
  const categoryId = await t.mutation(api.categories.create, validCategory)
  return { categoryId, walletId }
}

async function setupTwoWallets(t: ReturnType<typeof convexTest>) {
  const w1 = await t.mutation(api.wallets.create, { ...validWallet, order: 0 })
  const w2 = await t.mutation(api.wallets.create, { ...validWallet, name: 'Card', order: 1 })
  return { w1, w2 }
}

describe('convex/trns', () => {
  describe('create — expense', () => {
    it('creates an expense transaction', async () => {
      const t = convexTest(schema, modules)
      const { categoryId, walletId } = await setupWalletAndCategory(t)

      const id = await t.mutation(api.trns.create, {
        amount: 42.5,
        categoryId,
        date: Date.now(),
        type: 0,
        walletId,
      })

      const trns = await t.query(api.trns.list, { paginationOpts: { cursor: null, numItems: 10 } })
      expect(trns!.page).toHaveLength(1)
      expect(trns!.page[0]).toMatchObject({
        _id: id,
        amount: 42.5,
        categoryId,
        type: 0,
        userId: 'test-user-id',
        walletId,
      })
    })

    it('creates an adjustment transaction', async () => {
      const t = convexTest(schema, modules)
      const { walletId } = await setupWalletAndCategory(t)

      const id = await t.mutation(api.trns.create, {
        amount: 500,
        categoryId: 'adjustment',
        date: Date.now(),
        type: 0,
        walletId,
      })
      expect(id).toBeDefined()
    })

    it('throws for zero amount', async () => {
      const t = convexTest(schema, modules)
      const { categoryId, walletId } = await setupWalletAndCategory(t)

      await expect(
        t.mutation(api.trns.create, {
          amount: 0,
          categoryId,
          date: Date.now(),
          type: 0,
          walletId,
        }),
      ).rejects.toThrow('Amount must be positive')
    })

    it('throws without wallet', async () => {
      const t = convexTest(schema, modules)
      const { categoryId } = await setupWalletAndCategory(t)

      await expect(
        t.mutation(api.trns.create, {
          amount: 100,
          categoryId,
          date: Date.now(),
          type: 0,
        }),
      ).rejects.toThrow('Wallet is required')
    })

    it('throws for wallet owned by another user', async () => {
      const t = convexTest(schema, modules)
      const { walletId } = await setupWalletAndCategory(t)

      setMockUser('other-user')
      const otherCat = await t.mutation(api.categories.create, { ...validCategory, name: 'Other' })

      await expect(
        t.mutation(api.trns.create, {
          amount: 100,
          categoryId: otherCat,
          date: Date.now(),
          type: 0,
          walletId,
        }),
      ).rejects.toThrow('Wallet not found')
    })

    it('throws for "transfer" categoryId on non-transfer type', async () => {
      const t = convexTest(schema, modules)
      const { walletId } = await setupWalletAndCategory(t)

      await expect(
        t.mutation(api.trns.create, {
          amount: 100,
          categoryId: 'transfer',
          date: Date.now(),
          type: 0,
          walletId,
        }),
      ).rejects.toThrow('categoryId "transfer" is only allowed for Transfer type')
    })
  })

  describe('create — transfer', () => {
    it('creates a transfer between two wallets', async () => {
      const t = convexTest(schema, modules)
      const { w1, w2 } = await setupTwoWallets(t)

      const id = await t.mutation(api.trns.create, {
        date: Date.now(),
        expenseAmount: 100,
        expenseWalletId: w1,
        incomeAmount: 95,
        incomeWalletId: w2,
        type: 2,
      })

      const trns = await t.query(api.trns.list, { paginationOpts: { cursor: null, numItems: 10 } })
      expect(trns!.page[0]).toMatchObject({
        _id: id,
        categoryId: 'transfer',
        expenseAmount: 100,
        incomeAmount: 95,
        type: 2,
      })
    })

    it('throws for same wallet on both sides', async () => {
      const t = convexTest(schema, modules)
      const { w1 } = await setupTwoWallets(t)

      await expect(
        t.mutation(api.trns.create, {
          date: Date.now(),
          expenseAmount: 100,
          expenseWalletId: w1,
          incomeAmount: 100,
          incomeWalletId: w1,
          type: 2,
        }),
      ).rejects.toThrow('Transfer wallets must be different')
    })

    it('throws for non-"transfer" categoryId', async () => {
      const t = convexTest(schema, modules)
      const { w1, w2 } = await setupTwoWallets(t)
      const catId = await t.mutation(api.categories.create, validCategory)

      await expect(
        t.mutation(api.trns.create, {
          categoryId: catId,
          date: Date.now(),
          expenseAmount: 100,
          expenseWalletId: w1,
          incomeAmount: 100,
          incomeWalletId: w2,
          type: 2,
        }),
      ).rejects.toThrow('Transfer categoryId must be "transfer"')
    })
  })

  describe('remove', () => {
    it('removes a transaction', async () => {
      const t = convexTest(schema, modules)
      const { categoryId, walletId } = await setupWalletAndCategory(t)
      const id = await t.mutation(api.trns.create, {
        amount: 100,
        categoryId,
        date: Date.now(),
        type: 0,
        walletId,
      })

      await t.mutation(api.trns.remove, { id })

      const trns = await t.query(api.trns.list, { paginationOpts: { cursor: null, numItems: 10 } })
      expect(trns!.page).toHaveLength(0)
    })

    it('silently ignores trn owned by another user', async () => {
      const t = convexTest(schema, modules)
      const { categoryId, walletId } = await setupWalletAndCategory(t)
      const id = await t.mutation(api.trns.create, {
        amount: 100,
        categoryId,
        date: Date.now(),
        type: 0,
        walletId,
      })

      setMockUser('other-user')
      await t.mutation(api.trns.remove, { id })

      setMockUser('test-user-id')
      const trns = await t.query(api.trns.list, { paginationOpts: { cursor: null, numItems: 10 } })
      expect(trns!.page).toHaveLength(1)
    })
  })

  describe('idsHash', () => {
    it('returns consistent hash after create+delete cycle (XOR symmetry)', async () => {
      const t = convexTest(schema, modules)
      const { categoryId, walletId } = await setupWalletAndCategory(t)

      const hashBefore = await t.query(api.trns.idsHash)

      const id = await t.mutation(api.trns.create, {
        amount: 50,
        categoryId,
        date: Date.now(),
        type: 0,
        walletId,
      })
      await t.mutation(api.trns.remove, { id })

      const hashAfter = await t.query(api.trns.idsHash)
      expect(hashAfter!.hash).toBe(hashBefore!.hash)
    })
  })
})
