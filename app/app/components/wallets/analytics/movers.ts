import type { CategoryId } from '~/components/categories/types'

/** Categories the top-movers list shows. */
export const TOP_MOVERS_COUNT = 5

export type Mover = { current: number, delta: number, id: CategoryId, previous: number, share?: number }

/** Categories whose spending changed the most against the previous period, by the size of the change. */
export function topMovers(current: Map<CategoryId, number>, previous: Map<CategoryId, number>, count = TOP_MOVERS_COUNT): Mover[] {
  const ids = new Set([...current.keys(), ...previous.keys()])
  return [...ids]
    .map((id) => {
      const now = current.get(id) ?? 0
      const before = previous.get(id) ?? 0
      return { current: now, delta: now - before, id, previous: before, share: before ? (now - before) / before : undefined }
    })
    .filter(item => item.delta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, count)
}

/** Share of the change, and of that period's spending, one trn must reach to count as a one-off. */
export const ONE_OFF_SHARE = 0.5

/**
 * Whether a single trn explains the change: the largest trn of the period that grew is most of that period's
 * spending in the category and most of the change.
 */
export function isOneOff(mover: Mover, largest: { current: number, previous: number }): boolean {
  const [total, trn] = mover.delta > 0 ? [mover.current, largest.current] : [mover.previous, largest.previous]
  return trn >= ONE_OFF_SHARE * total && trn >= ONE_OFF_SHARE * Math.abs(mover.delta)
}
