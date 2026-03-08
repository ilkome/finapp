import defu from 'defu'

import type { MiniItemConfig } from '~/components/stat/useStatConfig'

import { ConfigSchema } from '~/components/stat/useStatConfig'

/**
 * Compute a new config by merging a partial update into the current config.
 * Returns the new config, or null if the result fails Zod validation.
 */
export function applyConfigUpdate(
  current: MiniItemConfig,
  key: keyof MiniItemConfig,
  value: Partial<MiniItemConfig[keyof MiniItemConfig]>,
): MiniItemConfig | null {
  const update = {
    ...current,
    [key]: typeof value === 'object' ? defu(value, current[key]) : value,
  }

  if (!ConfigSchema.safeParse(update).success)
    return null

  return update as MiniItemConfig
}
