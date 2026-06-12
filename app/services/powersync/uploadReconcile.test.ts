import type { CrudEntry } from '@powersync/web'

import { describe, expect, it, vi } from 'vitest'
import { planDivergence } from '~~/services/powersync/uploadReconcile'

vi.mock('@powersync/web', () => ({
  UpdateType: { DELETE: 'DELETE', PATCH: 'PATCH', PUT: 'PUT' },
}))

function op(over: Partial<CrudEntry>): CrudEntry {
  return { id: 'a', op: 'PUT', opData: {}, table: 'trns', ...over } as unknown as CrudEntry
}

describe('planDivergence', () => {
  it('returns a no-op plan for empty input', () => {
    expect(planDivergence([])).toEqual({ needsReload: false, toRevert: [] })
  })

  it('reverts every row when all diverged ops are PUT', () => {
    const ops = [
      op({ id: 'a', op: 'PUT', table: 'trns' }),
      op({ id: 'b', op: 'PUT', table: 'wallets' }),
    ]
    expect(planDivergence(ops)).toEqual({
      needsReload: false,
      toRevert: [{ id: 'a', table: 'trns' }, { id: 'b', table: 'wallets' }],
    })
  })

  it('requires reload (reverting nothing) when a PATCH diverged', () => {
    const ops = [op({ id: 'a', op: 'PATCH', table: 'trns' })]
    expect(planDivergence(ops)).toEqual({ needsReload: true, toRevert: [] })
  })

  it('requires reload (reverting nothing) when a DELETE diverged', () => {
    const ops = [op({ id: 'a', op: 'DELETE', table: 'trns' })]
    expect(planDivergence(ops)).toEqual({ needsReload: true, toRevert: [] })
  })

  it('requires reload for a mixed PUT + PATCH batch (any non-PUT wins)', () => {
    const ops = [
      op({ id: 'a', op: 'PUT', table: 'trns' }),
      op({ id: 'b', op: 'PATCH', table: 'trns' }),
    ]
    expect(planDivergence(ops)).toEqual({ needsReload: true, toRevert: [] })
  })
})
