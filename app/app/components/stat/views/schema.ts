import { z } from 'zod/v4'

import { ConfigSchema, defaultConfig } from '~/components/stat/config/schema'
import { parseStoredStatConfig } from '~/components/stat/config/useStatConfig'

export const STAT_VIEW_SCHEMA_VERSION = 1

const comparatorSchema = z.enum(['<', '<=', '=', '!=', '>=', '>'])
const periodConditionSchema = z.object({ comparator: comparatorSchema, kind: z.literal('period'), unit: z.enum(['day', 'week', 'month', 'year']), value: z.number().int().positive() })
const categoryCountConditionSchema = z.object({ comparator: comparatorSchema, kind: z.literal('categoryCount'), scope: z.enum(['all', 'parent']), value: z.number().int().nonnegative() })
export const ConditionSchema = z.discriminatedUnion('kind', [periodConditionSchema, categoryCountConditionSchema])
export type Condition = z.infer<typeof ConditionSchema>
export type ConditionGroup = { children: Array<Condition | ConditionGroup>, operator: 'and' | 'or' }
export const ConditionGroupSchema: z.ZodType<ConditionGroup> = z.lazy(() => z.object({
  children: z.array(z.union([ConditionSchema, ConditionGroupSchema])).min(1),
  operator: z.enum(['and', 'or']),
}))

const persistedConfigSchema = z.preprocess(
  value => parseStoredStatConfig(value, structuredClone(defaultConfig)) ?? value,
  ConfigSchema,
)

export const StatViewSchema = z.object({
  autoRule: ConditionGroupSchema.nullable(),
  config: persistedConfigSchema,
  createdAt: z.number().int().nonnegative(),
  id: z.string().min(1),
  isAutoEnabled: z.boolean(),
  name: z.string().trim().min(1).max(120),
  schemaVersion: z.number().int().positive(),
  scope: z.literal('dashboard'),
  sortOrder: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
  userId: z.string().min(1),
}).superRefine((view, ctx) => {
  if (view.isAutoEnabled && !view.autoRule)
    ctx.addIssue({ code: 'custom', message: 'Automatic views require a rule', path: ['autoRule'] })
})

export type StatViewRecord = z.infer<typeof StatViewSchema>

export function migrateStatView(value: unknown): StatViewRecord | null {
  const raw = value as Record<string, unknown> | null
  if (!raw)
    return null
  const migrated = { ...raw, schemaVersion: raw.schemaVersion ?? STAT_VIEW_SCHEMA_VERSION }
  const parsed = StatViewSchema.safeParse(migrated)
  return parsed.success ? parsed.data : null
}
