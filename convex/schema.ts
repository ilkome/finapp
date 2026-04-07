import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

import { TrnType, walletTypeValidator } from './validators'

export default defineSchema({
  categories: defineTable({
    color: v.string(),
    icon: v.string(),
    name: v.string(),
    parentId: v.union(v.id('categories'), v.literal(0)),
    showInLastUsed: v.boolean(),
    showInQuickSelector: v.boolean(),
    updatedAt: v.optional(v.number()),
    userId: v.string(),
  })
    .index('by_user', ['userId'])
    .index('by_user_name_parent', ['userId', 'name', 'parentId'])
    .index('by_user_parent', ['userId', 'parentId']),

  rates: defineTable({
    date: v.string(),
    rates: v.record(v.string(), v.number()),
    source: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index('by_date', ['date'])
    .index('by_date_source', ['date', 'source']),

  syncMeta: defineTable({
    trnsIdsHash: v.optional(v.string()),
    userId: v.string(),
  }).index('by_user', ['userId']),

  trns: defineTable({
    amount: v.optional(v.number()),
    categoryId: v.optional(v.union(v.id('categories'), v.literal('transfer'), v.literal('adjustment'))),
    date: v.number(),
    desc: v.optional(v.string()),
    expenseAmount: v.optional(v.number()),
    expenseWalletId: v.optional(v.id('wallets')),
    incomeAmount: v.optional(v.number()),
    incomeWalletId: v.optional(v.id('wallets')),
    type: v.union(
      v.literal(TrnType.Expense),
      v.literal(TrnType.Income),
      v.literal(TrnType.Transfer),
    ),
    updatedAt: v.number(),
    userId: v.string(),
    walletId: v.optional(v.id('wallets')),
  })
    .index('by_user', ['userId'])
    .index('by_user_date', ['userId', 'date'])
    .index('by_user_wallet', ['userId', 'walletId'])
    .index('by_user_expenseWallet', ['userId', 'expenseWalletId'])
    .index('by_user_incomeWallet', ['userId', 'incomeWalletId'])
    .index('by_user_category', ['userId', 'categoryId'])
    .index('by_user_updatedAt', ['userId', 'updatedAt']),

  userSettings: defineTable({
    baseCurrency: v.string(),
    locale: v.optional(v.union(v.literal('en'), v.literal('ru'))),
    userId: v.string(),
  }).index('by_user', ['userId']),

  wallets: defineTable({
    color: v.string(),
    creditLimit: v.optional(v.number()),
    currency: v.string(),
    desc: v.optional(v.string()),
    isArchived: v.boolean(),
    isExcludeInTotal: v.boolean(),
    isWithdrawal: v.boolean(),
    name: v.string(),
    order: v.number(),
    type: walletTypeValidator,
    updatedAt: v.optional(v.number()),
    userId: v.string(),
  }).index('by_user', ['userId']),
})
