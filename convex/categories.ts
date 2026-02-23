import { v } from 'convex/values'

import type { Id } from './_generated/dataModel'
import type { MutationCtx } from './_generated/server'

import { mutation, query } from './_generated/server'
import { getAuthUser, getOwnEntity, requireAuthUser } from './shared'
import { removeTrnsFromHash } from './trnsHash'

// --- Shared helpers ---

async function validateParentId(ctx: MutationCtx, parentId: Id<'categories'> | 0, userId: string, selfId?: Id<'categories'>) {
  if (parentId === 0)
    return
  if (selfId && parentId === selfId)
    throw new Error('Category cannot be its own parent')
  const parent = await getOwnEntity(ctx, parentId, userId, 'Parent category not found')
  if (parent.parentId !== 0)
    throw new Error('Cannot nest more than 2 levels deep')
}

async function validateNameUniqueness(ctx: MutationCtx, name: string, parentId: Id<'categories'> | 0, userId: string, excludeId?: Id<'categories'>) {
  const duplicates = await ctx.db
    .query('categories')
    .withIndex('by_user_name_parent', q => q.eq('userId', userId).eq('name', name).eq('parentId', parentId))
    .collect()
  if (duplicates.some(c => c._id !== excludeId))
    throw new Error('Category with this name already exists')
}

async function syncChildIdsOnParentChange(ctx: MutationCtx, id: Id<'categories'>, oldParentId: Id<'categories'> | 0, newParentId: Id<'categories'> | 0, userId: string) {
  if (newParentId === oldParentId)
    return

  if (oldParentId !== 0) {
    const oldParent = await ctx.db.get(oldParentId)
    if (oldParent && oldParent.userId === userId) {
      const updatedChildIds = (oldParent.childIds ?? []).filter(cid => cid !== id)
      await ctx.db.patch(oldParentId, {
        childIds: updatedChildIds.length ? updatedChildIds : undefined,
      })
    }
  }

  if (newParentId !== 0) {
    const newParent = await ctx.db.get(newParentId)
    if (newParent && newParent.userId === userId) {
      await ctx.db.patch(newParentId, {
        childIds: [...(newParent.childIds ?? []), id],
      })
    }
  }
}

async function removeFromParentChildIds(ctx: MutationCtx, id: Id<'categories'>, parentId: Id<'categories'> | 0, userId: string) {
  if (parentId === 0)
    return
  const parent = await ctx.db.get(parentId)
  if (parent && parent.userId === userId) {
    const updatedChildIds = (parent.childIds ?? []).filter(cid => cid !== id)
    await ctx.db.patch(parentId, {
      childIds: updatedChildIds.length ? updatedChildIds : undefined,
    })
  }
}

async function updateCategoryCore(
  ctx: MutationCtx,
  id: Id<'categories'>,
  args: {
    childIds?: Id<'categories'>[]
    color?: string
    icon?: string
    name?: string
    parentId?: Id<'categories'> | 0
    showInLastUsed?: boolean
    showInQuickSelector?: boolean
  },
  userId: string,
) {
  if (args.icon !== undefined && !args.icon.trim())
    throw new Error('Icon is required')
  if (args.name !== undefined && !args.name.trim())
    throw new Error('Name is required')

  const category = await getOwnEntity(ctx, id, userId)

  if (args.parentId !== undefined && args.parentId !== 0)
    await validateParentId(ctx, args.parentId, userId, id)
  if (args.name !== undefined)
    await validateNameUniqueness(ctx, args.name, args.parentId ?? category.parentId, userId, id)
  if (args.parentId !== undefined)
    await syncChildIdsOnParentChange(ctx, id, category.parentId, args.parentId, userId)

  const now = Date.now()
  await ctx.db.patch(id, { ...args, updatedAt: now })
  return now
}

// --- Queries & Mutations ---

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthUser(ctx)
    if (!user)
      return null
    return await ctx.db
      .query('categories')
      .withIndex('by_user', q => q.eq('userId', user._id))
      .collect()
  },
})

export const create = mutation({
  args: {
    childIds: v.optional(v.array(v.id('categories'))),
    color: v.string(),
    icon: v.string(),
    name: v.string(),
    parentId: v.optional(v.union(v.id('categories'), v.literal(0))),
    showInLastUsed: v.boolean(),
    showInQuickSelector: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx)
    if (!args.icon.trim())
      throw new Error('Icon is required')
    if (!args.name.trim())
      throw new Error('Name is required')

    const parentId = args.parentId ?? 0

    await validateNameUniqueness(ctx, args.name, parentId, user._id)
    if (parentId !== 0)
      await validateParentId(ctx, parentId, user._id)

    const newId = await ctx.db.insert('categories', {
      ...args,
      parentId,
      updatedAt: Date.now(),
      userId: user._id,
    })

    if (parentId !== 0) {
      const parent = await ctx.db.get(parentId)
      if (parent && parent.userId === user._id) {
        await ctx.db.patch(parentId, {
          childIds: [...(parent.childIds ?? []), newId],
        })
      }
    }

    return newId
  },
})

export const update = mutation({
  args: {
    childIds: v.optional(v.array(v.id('categories'))),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    id: v.id('categories'),
    name: v.optional(v.string()),
    parentId: v.optional(v.union(v.id('categories'), v.literal(0))),
    showInLastUsed: v.optional(v.boolean()),
    showInQuickSelector: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...args }) => {
    const user = await requireAuthUser(ctx)
    await updateCategoryCore(ctx, id, args, user._id)
  },
})

export const remove = mutation({
  args: { id: v.id('categories') },
  handler: async (ctx, { id }) => {
    const user = await requireAuthUser(ctx)
    const category = await getOwnEntity(ctx, id, user._id)

    if (category.childIds?.length)
      throw new Error('Cannot delete category with children')

    // Cascade delete all trns in this category (paginated)
    const deletedIds: string[] = []
    let cursor: string | null = null
    let isDone = false
    while (!isDone) {
      const page = await ctx.db
        .query('trns')
        .withIndex('by_user_category', q => q.eq('userId', user._id).eq('categoryId', id))
        .paginate({ cursor, numItems: 500 })
      for (const trn of page.page) {
        await ctx.db.delete(trn._id)
        deletedIds.push(trn._id)
      }
      isDone = page.isDone
      cursor = page.continueCursor
    }

    if (deletedIds.length)
      await removeTrnsFromHash(ctx, user._id, deletedIds)

    await removeFromParentChildIds(ctx, id, category.parentId, user._id)
    await ctx.db.delete(id)
  },
})

export const updateWithChildren = mutation({
  args: {
    childIds: v.array(v.id('categories')),
    color: v.string(),
    icon: v.optional(v.string()),
    id: v.id('categories'),
    name: v.optional(v.string()),
    parentId: v.optional(v.union(v.id('categories'), v.literal(0))),
    showInLastUsed: v.optional(v.boolean()),
    showInQuickSelector: v.optional(v.boolean()),
  },
  handler: async (ctx, { childIds, id, ...args }) => {
    const user = await requireAuthUser(ctx)
    const now = await updateCategoryCore(ctx, id, args, user._id)

    for (const childId of childIds) {
      const child = await ctx.db.get(childId)
      if (!child || child.userId !== user._id)
        continue
      if (child.parentId !== id)
        throw new Error('Child does not belong to this parent')
      await ctx.db.patch(childId, { color: args.color, updatedAt: now })
    }
  },
})
