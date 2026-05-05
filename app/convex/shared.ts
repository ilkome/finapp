import type { Doc, Id, TableNames } from './_generated/dataModel'
import type { MutationCtx, QueryCtx } from './_generated/server'

import { authComponent } from './auth'

export { TrnType } from './validators'

/**
 * Validate string field length. Throws if value exceeds maxLen.
 */
export function validateStringLength(value: string | undefined, maxLen: number, fieldName: string) {
  if (value !== undefined && value.length > maxLen)
    throw new Error(`${fieldName} must be at most ${maxLen} characters`)
}

/**
 * Validate numeric field range. Throws if value is outside [min, max].
 * Skips check when value is undefined (optional fields).
 */
export function validateNumberRange(value: number | undefined, min: number, max: number, fieldName: string) {
  if (value !== undefined && (value < min || value > max))
    throw new Error(`${fieldName} must be between ${min} and ${max}`)
}

// 2000-01-01 .. 2100-01-01 in ms
export const DATE_MIN = 946_684_800_000
export const DATE_MAX = 4_102_444_800_000

export const AMOUNT_MAX = 1_000_000_000_000
export const CREDIT_LIMIT_MAX = 1_000_000_000

/**
 * Get authenticated user or return null (for queries).
 */
export async function getAuthUser(ctx: QueryCtx) {
  return await authComponent.safeGetAuthUser(ctx)
}

/**
 * Get authenticated user or throw (for mutations/actions).
 */
export async function requireAuthUser(ctx: QueryCtx) {
  const user = await authComponent.safeGetAuthUser(ctx)
  if (!user)
    throw new Error('Unauthorized')
  return user
}

type OwnedTable = {
  [K in TableNames]: Doc<K> extends { userId: string } ? K : never
}[TableNames]

export async function getOwnEntity<T extends OwnedTable>(
  ctx: MutationCtx,
  id: Id<T>,
  userId: string,
  errorMessage = 'Not found',
): Promise<Doc<T>> {
  const entity = await ctx.db.get(id)
  if (!entity || entity.userId !== userId)
    throw new Error(errorMessage)
  return entity
}
