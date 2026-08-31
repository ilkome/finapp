import { z } from 'zod/v4'

import { ConfigSchema } from '~/components/stat/config/schema'
import { statConfigPanelIds } from '~/components/stat/types'
import { applyBlockRuleConfig } from '~/components/stat/views/blockRules'

import type { BlockRule } from './types'

const comparatorSchema = z.enum(['<', '<=', '=', '!=', '>=', '>'])
const periodConditionSchema = z.object({ comparator: comparatorSchema, kind: z.literal('period'), unit: z.enum(['day', 'week', 'month', 'year']), value: z.number().int().positive() })
const categoryCountConditionSchema = z.object({ comparator: comparatorSchema, kind: z.literal('categoryCount'), scope: z.enum(['all', 'parent']), value: z.number().int().nonnegative() })
const contentWidthConditionSchema = z.object({ comparator: comparatorSchema, kind: z.literal('contentWidth'), unit: z.literal('px'), value: z.number().int().nonnegative() })
export const ConditionSchema = z.discriminatedUnion('kind', [periodConditionSchema, categoryCountConditionSchema, contentWidthConditionSchema])
export type Condition = z.infer<typeof ConditionSchema>
export type ConditionGroup = { children: Array<Condition | ConditionGroup>, operator: 'and' | 'or' }
export const ConditionGroupSchema: z.ZodType<ConditionGroup> = z.lazy(() => z.object({
  children: z.array(z.union([ConditionSchema, ConditionGroupSchema])).min(1),
  operator: z.enum(['and', 'or']),
}))

const blockRuleSchema = z.object({
  condition: ConditionGroupSchema,
  id: z.string().min(1),
  isEnabled: z.boolean(),
  overrides: z.record(z.string(), z.unknown()),
})
const blockRulesSchema = z.partialRecord(z.enum(statConfigPanelIds), z.array(blockRuleSchema))
export const StatViewConfigSchema = z.object({
  base: ConfigSchema,
  blockRules: blockRulesSchema,
}).superRefine((config, ctx) => {
  for (const panel of statConfigPanelIds) {
    for (const [index, rule] of (config.blockRules[panel] ?? []).entries()) {
      try {
        applyBlockRuleConfig(panel, config.base, rule.overrides as BlockRule['overrides'])
      }
      catch {
        ctx.addIssue({ code: 'custom', message: 'Invalid block rule overrides', path: ['blockRules', panel, index, 'overrides'] })
      }
    }
  }
})

export const StatViewSchema = z.object({
  autoRule: ConditionGroupSchema.nullable(),
  config: StatViewConfigSchema,
  createdAt: z.number().int().nonnegative(),
  id: z.string().min(1),
  isAutoEnabled: z.boolean(),
  name: z.string().trim().min(1).max(120),
  scope: z.literal('dashboard'),
  sortOrder: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
  userId: z.string().min(1),
}).superRefine((view, ctx) => {
  if (view.isAutoEnabled && !view.autoRule)
    ctx.addIssue({ code: 'custom', message: 'Automatic views require a rule', path: ['autoRule'] })
})

export type StatViewRecord = z.infer<typeof StatViewSchema>
