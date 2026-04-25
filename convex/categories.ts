import { v } from 'convex/values'

import type { Id } from './_generated/dataModel'
import type { MutationCtx } from './_generated/server'

import { internal } from './_generated/api'
import { action, internalMutation, internalQuery, mutation, query } from './_generated/server'
import { getAuthUser, getOwnEntity, requireAuthUser, validateStringLength } from './shared'
import { emitTombstone, emitTombstones } from './tombstones'
import { toggleTrnsHash } from './trnsHash'

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
  const duplicate = await ctx.db
    .query('categories')
    .withIndex('by_user_name_parent', q => q.eq('userId', userId).eq('name', name).eq('parentId', parentId))
    .filter(q => excludeId ? q.neq(q.field('_id'), excludeId) : true)
    .first()
  if (duplicate)
    throw new Error('Category with this name already exists')
}

async function updateCategoryCore(
  ctx: MutationCtx,
  id: Id<'categories'>,
  args: {
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
  if (args.color !== undefined && !args.color.trim())
    throw new Error('Color is required')
  validateStringLength(args.name, 100, 'Name')
  validateStringLength(args.color, 50, 'Color')
  validateStringLength(args.icon, 50, 'Icon')

  const category = await getOwnEntity(ctx, id, userId)

  if (args.parentId !== undefined && args.parentId !== 0)
    await validateParentId(ctx, args.parentId, userId, id)
  if (args.name !== undefined || args.parentId !== undefined)
    await validateNameUniqueness(ctx, args.name ?? category.name, args.parentId ?? category.parentId, userId, id)

  const now = Date.now()
  await ctx.db.patch(id, { ...args, updatedAt: now })
  return now
}

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

const REALTIME_DELTA_LIMIT = 500

export const deltaRealtime = query({
  args: { since: v.number() },
  handler: async (ctx, { since }) => {
    const user = await getAuthUser(ctx)
    if (!user)
      return null
    const serverTime = Date.now()
    const docsPlusOne = await ctx.db
      .query('categories')
      .withIndex('by_user_updatedAt', q =>
        q.eq('userId', user._id).gt('updatedAt', since))
      .take(REALTIME_DELTA_LIMIT + 1)
    const truncated = docsPlusOne.length > REALTIME_DELTA_LIMIT
    const docs = truncated ? docsPlusOne.slice(0, REALTIME_DELTA_LIMIT) : docsPlusOne
    const tombstones = await ctx.db
      .query('tombstones')
      .withIndex('by_user_entity_deletedAt', q =>
        q.eq('userId', user._id).eq('entity', 'categories').gt('deletedAt', since))
      .take(REALTIME_DELTA_LIMIT)
    return {
      deletedIds: tombstones.map(t => t.entityId),
      docs,
      serverTime,
      truncated,
    }
  },
})

export const create = mutation({
  args: {
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
    if (!args.color.trim())
      throw new Error('Color is required')
    validateStringLength(args.name, 100, 'Name')
    validateStringLength(args.color, 50, 'Color')
    validateStringLength(args.icon, 50, 'Icon')

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

    return newId
  },
})

export const update = mutation({
  args: {
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

export const validateCategoryRemoval = internalQuery({
  args: { id: v.id('categories'), userId: v.string() },
  handler: async (ctx, { id, userId }) => {
    const category = await ctx.db.get(id)
    if (!category || category.userId !== userId)
      throw new Error('Not found')
    const child = await ctx.db
      .query('categories')
      .withIndex('by_user_parent', q => q.eq('userId', userId).eq('parentId', id))
      .first()
    if (child)
      throw new Error('Cannot delete category with children')
  },
})

export const removeTrnsByCategoryPage = internalMutation({
  args: {
    categoryId: v.id('categories'),
    cursor: v.union(v.string(), v.null()),
    userId: v.string(),
  },
  handler: async (ctx, { categoryId, cursor, userId }) => {
    const page = await ctx.db
      .query('trns')
      .withIndex('by_user_category', q => q.eq('userId', userId).eq('categoryId', categoryId))
      .paginate({ cursor, numItems: 500 })

    const deletedIds: string[] = []
    for (const trn of page.page) {
      await ctx.db.delete(trn._id)
      deletedIds.push(trn._id)
    }

    if (deletedIds.length) {
      await toggleTrnsHash(ctx, userId, deletedIds)
      await emitTombstones(ctx, userId, 'trns', deletedIds)
    }

    return { continueCursor: page.continueCursor, isDone: page.isDone }
  },
})

export const removeCategoryFinalize = internalMutation({
  args: {
    categoryId: v.id('categories'),
    userId: v.string(),
  },
  handler: async (ctx, { categoryId, userId }) => {
    const category = await ctx.db.get(categoryId)
    if (!category || category.userId !== userId)
      return
    await ctx.db.delete(categoryId)
    await emitTombstone(ctx, userId, 'categories', categoryId)
  },
})

export const remove = action({
  args: { id: v.id('categories') },
  handler: async (ctx, { id }) => {
    const user = await ctx.runQuery(internal.user.getCurrentUser)
    if (!user)
      throw new Error('Unauthorized')

    // Validate before cascade delete (ownership + no children)
    await ctx.runQuery(internal.categories.validateCategoryRemoval, {
      id,
      userId: user._id,
    })

    let cursor: string | null = null
    let isDone = false
    while (!isDone) {
      const result: { continueCursor: string, isDone: boolean } = await ctx.runMutation(internal.categories.removeTrnsByCategoryPage, {
        categoryId: id,
        cursor,
        userId: user._id,
      })
      isDone = result.isDone
      cursor = result.continueCursor
    }

    await ctx.runMutation(internal.categories.removeCategoryFinalize, {
      categoryId: id,
      userId: user._id,
    })
  },
})

export const setChildren = mutation({
  args: {
    addIds: v.array(v.id('categories')),
    childrenColor: v.optional(v.string()),
    id: v.id('categories'),
    removeIds: v.array(v.id('categories')),
  },
  handler: async (ctx, { addIds, childrenColor, id, removeIds }) => {
    const user = await requireAuthUser(ctx)
    const parent = await getOwnEntity(ctx, id, user._id)
    if (parent.parentId !== 0)
      throw new Error('Only a root category can adopt children')

    // Dedupe and reject overlap
    const addSet = new Set(addIds)
    const removeSet = new Set(removeIds)
    if (addSet.size !== addIds.length || removeSet.size !== removeIds.length)
      throw new Error('Duplicate IDs in addIds or removeIds')
    for (const id of addSet) {
      if (removeSet.has(id))
        throw new Error('Same ID appears in both addIds and removeIds')
    }
    if (addSet.has(id))
      throw new Error('Category cannot be its own child')

    validateStringLength(childrenColor, 50, 'Color')

    // Validate each add: own, leaf (no own children)
    for (const addId of addSet) {
      await getOwnEntity(ctx, addId, user._id)
      const ownChild = await ctx.db
        .query('categories')
        .withIndex('by_user_parent', q => q.eq('userId', user._id).eq('parentId', addId))
        .first()
      if (ownChild)
        throw new Error('Cannot move a category that has its own children')
    }

    // Validate each remove currently belongs to this parent
    for (const removeId of removeSet) {
      const cat = await getOwnEntity(ctx, removeId, user._id)
      if (cat.parentId !== id)
        throw new Error('Child does not belong to this parent')
    }

    // Name uniqueness: existing kept + added
    const existingChildren = await ctx.db
      .query('categories')
      .withIndex('by_user_parent', q => q.eq('userId', user._id).eq('parentId', id))
      .collect()
    const finalNames = new Set<string>()
    for (const child of existingChildren) {
      if (removeSet.has(child._id) || addSet.has(child._id))
        continue
      if (finalNames.has(child.name))
        throw new Error('Duplicate child name under parent')
      finalNames.add(child.name)
    }
    for (const addId of addSet) {
      const cat = await ctx.db.get(addId)
      if (!cat)
        throw new Error('Not found')
      if (finalNames.has(cat.name))
        throw new Error(`Category with name "${cat.name}" already exists under parent`)
      finalNames.add(cat.name)
    }

    const now = Date.now()

    for (const addId of addSet) {
      const patch: { color?: string, parentId: typeof id, updatedAt: number } = {
        parentId: id,
        updatedAt: now,
      }
      if (childrenColor)
        patch.color = childrenColor
      await ctx.db.patch(addId, patch)
    }
    for (const removeId of removeSet)
      await ctx.db.patch(removeId, { parentId: 0, updatedAt: now })

    // Propagate color to kept children if requested
    if (childrenColor) {
      for (const child of existingChildren) {
        if (removeSet.has(child._id) || addSet.has(child._id))
          continue
        await ctx.db.patch(child._id, { color: childrenColor, updatedAt: now })
      }
    }

    return now
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
