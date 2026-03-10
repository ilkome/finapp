import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'

import { api } from './_generated/api'
import schema from './schema'
import { modules } from './test_utils/setup.helper'

const validCategory = {
  color: '#ff0000',
  icon: 'food',
  name: 'Food',
  showInLastUsed: true,
  showInQuickSelector: true,
}

const validWallet = {
  color: '#000',
  currency: 'USD',
  name: 'Cash',
  order: 0,
  type: 'cash' as const,
}

describe('convex/categories', () => {
  describe('create', () => {
    it('creates a root category', async () => {
      const t = convexTest(schema, modules)
      const id = await t.mutation(api.categories.create, validCategory)

      const categories = await t.query(api.categories.list)
      expect(categories).toHaveLength(1)
      expect(categories![0]).toMatchObject({
        ...validCategory,
        _id: id,
        parentId: 0,
        userId: 'test-user-id',
      })
    })

    it('creates a child category', async () => {
      const t = convexTest(schema, modules)
      const parentId = await t.mutation(api.categories.create, validCategory)
      const childId = await t.mutation(api.categories.create, {
        ...validCategory,
        name: 'Groceries',
        parentId,
      })

      const categories = await t.query(api.categories.list)
      const child = categories!.find(c => c._id === childId)!
      expect(child.parentId).toBe(parentId)
    })

    it('throws for duplicate name at same level', async () => {
      const t = convexTest(schema, modules)
      await t.mutation(api.categories.create, validCategory)
      await expect(
        t.mutation(api.categories.create, validCategory),
      ).rejects.toThrow('Category with this name already exists')
    })

    it('allows same name under different parents', async () => {
      const t = convexTest(schema, modules)
      const parent1 = await t.mutation(api.categories.create, validCategory)
      const parent2 = await t.mutation(api.categories.create, { ...validCategory, name: 'Transport' })

      await t.mutation(api.categories.create, { ...validCategory, name: 'Taxi', parentId: parent1 })
      await t.mutation(api.categories.create, { ...validCategory, name: 'Taxi', parentId: parent2 })

      const categories = await t.query(api.categories.list)
      const taxis = categories!.filter(c => c.name === 'Taxi')
      expect(taxis).toHaveLength(2)
    })

    it('throws for nesting more than 2 levels deep', async () => {
      const t = convexTest(schema, modules)
      const parentId = await t.mutation(api.categories.create, validCategory)
      const childId = await t.mutation(api.categories.create, {
        ...validCategory,
        name: 'Groceries',
        parentId,
      })

      await expect(
        t.mutation(api.categories.create, {
          ...validCategory,
          name: 'Dairy',
          parentId: childId,
        }),
      ).rejects.toThrow('Cannot nest more than 2 levels deep')
    })
  })

  describe('update', () => {
    it('throws for duplicate name on rename', async () => {
      const t = convexTest(schema, modules)
      await t.mutation(api.categories.create, validCategory)
      const id2 = await t.mutation(api.categories.create, { ...validCategory, name: 'Transport' })

      await expect(
        t.mutation(api.categories.update, { id: id2, name: 'Food' }),
      ).rejects.toThrow('Category with this name already exists')
    })

    it('prevents setting self as parent', async () => {
      const t = convexTest(schema, modules)
      const id = await t.mutation(api.categories.create, validCategory)
      await expect(
        t.mutation(api.categories.update, { id, parentId: id }),
      ).rejects.toThrow('Category cannot be its own parent')
    })
  })

  describe('updateWithChildren', () => {
    it('propagates color to children', async () => {
      const t = convexTest(schema, modules)
      const parentId = await t.mutation(api.categories.create, validCategory)
      const childId = await t.mutation(api.categories.create, {
        ...validCategory,
        name: 'Groceries',
        parentId,
      })

      await t.mutation(api.categories.updateWithChildren, {
        childIds: [childId],
        color: '#00ff00',
        id: parentId,
      })

      const categories = await t.query(api.categories.list)
      const parent = categories!.find(c => c._id === parentId)!
      const child = categories!.find(c => c._id === childId)!
      expect(parent.color).toBe('#00ff00')
      expect(child.color).toBe('#00ff00')
    })

    it('throws if child does not belong to parent', async () => {
      const t = convexTest(schema, modules)
      const parentId = await t.mutation(api.categories.create, validCategory)
      const otherId = await t.mutation(api.categories.create, { ...validCategory, name: 'Other' })

      await expect(
        t.mutation(api.categories.updateWithChildren, {
          childIds: [otherId],
          color: '#00ff00',
          id: parentId,
        }),
      ).rejects.toThrow('Child does not belong to this parent')
    })
  })

  describe('remove (cascade)', () => {
    it('deletes category and its transactions', async () => {
      const t = convexTest(schema, modules)
      const walletId = await t.mutation(api.wallets.create, validWallet)
      const catId = await t.mutation(api.categories.create, validCategory)

      await t.mutation(api.trns.create, {
        amount: 50,
        categoryId: catId,
        date: Date.now(),
        type: 0,
        walletId,
      })

      await t.action(api.categories.remove, { id: catId })

      expect(await t.query(api.categories.list)).toHaveLength(0)
      const trns = await t.query(api.trns.list, { paginationOpts: { cursor: null, numItems: 10 } })
      expect(trns!.page).toHaveLength(0)
    })

    it('throws when deleting category with children', async () => {
      const t = convexTest(schema, modules)
      const parentId = await t.mutation(api.categories.create, validCategory)
      await t.mutation(api.categories.create, {
        ...validCategory,
        name: 'Child',
        parentId,
      })

      await expect(
        t.action(api.categories.remove, { id: parentId }),
      ).rejects.toThrow('Cannot delete category with children')
    })
  })
})
