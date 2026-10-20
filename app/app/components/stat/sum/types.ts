import type { SeriesSlugSelected } from '~/components/stat/types'

/** One summary tile: plain data, renderable without any store or provider. */
export type StatSumRecord = {
  amount: number
  /** Average per period over the configured window; absent when the average block is off. */
  average?: number
  /** Replaces the default average caption (a sheet's per-period average). */
  averageLabel?: string
  /** Per-granularity averages shown inside the tile (single-type reports). */
  averageByPeriod?: Record<string, number>
  isActive?: boolean
  /** Replaces the type name as the tile caption. */
  title?: string
  type: SeriesSlugSelected
}
