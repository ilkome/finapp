import { useStorage } from '@vueuse/core'

// Global, persisted forecast mode (see plans/recurrences.md §9). One setting drives every stat
// surface: off = actuals only, separate = fact + forecast shown apart, merged = projected total.
export const forecastModes = ['off', 'separate', 'merged'] as const
export type ForecastMode = typeof forecastModes[number]

export function useForecastMode() {
  return useStorage<ForecastMode>('finapp.forecastMode', 'off')
}

/** Cycle off -> separate -> merged -> off (used by the single-tap config row). */
export function nextForecastMode(mode: ForecastMode): ForecastMode {
  const i = forecastModes.indexOf(mode)
  return forecastModes[(i + 1) % forecastModes.length]!
}
